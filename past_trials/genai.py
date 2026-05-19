"""
genai.py
역할: preprocess_output.json을 읽어 각 무음 구간에 대해 Gemini API로 화면해설 대본을 생성하고
      타임스탬프 정보와 함께 ad_scripts.json으로 저장한다.
"""
import os
import re
import time
import math
import json
import google.generativeai as genai
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor, as_completed

load_dotenv()

# --설정 영역 start--
INPUT_JSON = "preprocess_output.json"
OUTPUT_JSON = "ad_scripts.json"
MAX_WORKERS = 5 
# --설정 영역 end--

genai.configure(api_key=os.environ["GEMINI_API_KEY"])


def generate_ad_script_from_video(duration_sec, video_before, video_after, keyframe_images, info_file=None):
    max_chars = math.floor((duration_sec - 1.0) * 5)
    if max_chars < 5:
        max_chars = 5

    uploaded_files = []
    try:
        prompt_contents = []

        if os.path.exists(video_before):
            print(f"      [API] Before 영상 업로드 중... ({video_before})")
            t0 = time.time()
            f_before = genai.upload_file(video_before)
            uploaded_files.append(f_before)
            print(f"      [API] Before 영상 서버 처리 대기 중... (state: {f_before.state.name})")
            while f_before.state.name == "PROCESSING":
                time.sleep(2)
                f_before = genai.get_file(f_before.name)
                print(f"      [API] Before 영상 처리 중... (state: {f_before.state.name})")
            if f_before.state.name == "FAILED":
                raise ValueError("Before 영상 서버 처리 실패")
            print(f"      [API] Before 영상 업로드 완료 (소요: {time.time()-t0:.1f}초, uri: {f_before.uri})")
            prompt_contents.append("1. Before Context (Video):")
            prompt_contents.append(f_before)
        else:
            print(f"      [SKIP] Before 영상 없음: {video_before}")

        print(f"      [API] 키프레임 이미지 {len(keyframe_images)}개 업로드 중...")
        prompt_contents.append("2. Keyframes (Images from the silence segment):")
        for i, img in enumerate(keyframe_images):
            if os.path.exists(img):
                print(f"      [API]   키프레임 {i+1}/{len(keyframe_images)} 업로드 중... ({img})")
                f_img = genai.upload_file(img)
                uploaded_files.append(f_img)
                prompt_contents.append(f_img)
                print(f"      [API]   키프레임 {i+1} 업로드 완료 (uri: {f_img.uri})")
            else:
                print(f"      [SKIP] 키프레임 없음: {img}")

        if os.path.exists(video_after):
            print(f"      [API] After 영상 업로드 중... ({video_after})")
            t0 = time.time()
            f_after = genai.upload_file(video_after)
            uploaded_files.append(f_after)
            print(f"      [API] After 영상 서버 처리 대기 중... (state: {f_after.state.name})")
            while f_after.state.name == "PROCESSING":
                time.sleep(2)
                f_after = genai.get_file(f_after.name)
                print(f"      [API] After 영상 처리 중... (state: {f_after.state.name})")
            if f_after.state.name == "FAILED":
                raise ValueError("After 영상 서버 처리 실패")
            print(f"      [API] After 영상 업로드 완료 (소요: {time.time()-t0:.1f}초, uri: {f_after.uri})")
            prompt_contents.append("3. After Context (Video):")
            prompt_contents.append(f_after)
        else:
            print(f"      [SKIP] After 영상 없음: {video_after}")

        info_text = ""
        if info_file and os.path.exists(info_file):
            with open(info_file, "r", encoding="utf-8") as f:
                info_text = f.read().strip()
            print(f"      [INFO] 구간 정보 파일 로드 완료: {info_file}")
        else:
            info_text = f"무대사 구간 총 길이: {duration_sec:.2f}초"

        user_prompt = f"""
[구간 정보]
{info_text}

- 전체 최대 허용 글자 수: 공백 포함 최대 {max_chars}자 이내로 엄수할 것.

위 첨부된 비디오 컨텍스트와 구간 내 이미지 데이터를 바탕으로 화면해설 대본을 생성하라.

[출력 형식 - 반드시 아래 JSON 배열만 출력할 것]
각 해설 문장이 무대사 구간 내 몇 초 시점부터 재생되어야 하는지 time(초, 클립 시작 기준 0.0)과 함께 반환하라.
- 각 문장의 time 값은 반드시 위 [구간 정보]의 해당 장면 '해설 time 허용 범위' 내에 있어야 한다.
- 문장 간 time 간격은 해당 문장의 TTS 재생 시간(초당 약 4음절)을 충분히 확보할 수 있도록 설정하라.
- 아직 시작하지 않은 장면의 내용을 이전 시간대에 미리 배치하지 말 것.

[
  {{"time": 0.5, "text": "해설 문장 1"}},
  {{"time": 3.2, "text": "해설 문장 2"}}
]
"""
        prompt_contents.append(user_prompt)

        system_instruction = """당신은 시각장애인을 위한 전문 오디오 화면해설(Audio Description) 작가입니다.
주어진 영상(앞뒤 상황)과 무대사 구간 내 키프레임 이미지들을 분석하여, 해당 구간의 핵심 시각적 변화를 묘사하십시오.

[절대 규칙]
1. 제약 시간: 각 해설은 해당 장면의 지속 시간보다 1초 이상 짧게 끝나는 분량으로 작성하십시오 (TTS 기준 초당 약 4음절).
2. 묘사 원칙: 인물의 행동·표정, 장면 전환, 풍경, 조명·색감 등 시각적으로 관찰 가능한 정보만 객관적으로 묘사하십시오. 인물의 심리 해석, 소리·음악에 대한 묘사는 금지합니다. 단, 조명 변화, 화면 속도감, 색조 등 시각적으로 관찰 가능한 분위기 요소는 묘사할 수 있습니다.
3. 앞뒤 상황 활용: 앞뒤 맥락은 현재 무대사 구간의 상황을 파악하는 용도로만 사용하십시오. 앞뒤 구간에서 발생한 사건을 해설에 직접 서술하지 마십시오.
4. 자막 처리: 화면 내 텍스트는 맥락 이해에 필수적인 경우에만 내용을 포함하고, 장식적이거나 반복적인 텍스트는 생략하십시오.
5. 장면 전환 및 시간 배치:
   - info.txt의 [장면 N] 항목에 명시된 '해설 time 허용 범위'를 반드시 준수하십시오.
   - 장면 N의 해설 time 값은 반드시 해당 장면의 시작 시각 이상이어야 합니다. 장면이 시작되기 전에 해당 장면 내용을 미리 묘사하는 것은 절대 금지입니다.
   - 키프레임 명명 규칙: cut##_before.jpg는 해당 전환 직전 프레임(이전 장면 말미), cut##_after.jpg는 전환 직후 프레임(새 장면 시작)입니다. after 키프레임이 속한 장면의 time은 반드시 해당 전환 시각 이후여야 합니다.
   - 개별 장면이 1.5초 미만으로 짧거나 내용이 연속적인 경우 여러 장면을 하나의 해설로 묶으십시오.
6. 출력 형식: 부연 설명, 인사말, 마크다운 기호는 일절 포함하지 마십시오. 어미는 '~합니다', '~하고 있습니다' 형태를 사용하십시오. 출력은 아래 user 프롬프트에 명시된 JSON 형식만 사용하십시오.
[입력파일 형식]
- 무대사 구간 내 키프레임들: silence_###_cut##_before.jpg / after.jpg
- 앞뒤 15초 맥락 영상 또는 오디오 (없을 수도 있음): silence_###_video_before/after.mp4
- 장면별 시간 범위 및 구간 총 길이 정보: silence_###_info.txt"""

        model = genai.GenerativeModel(
            model_name='gemini-3-flash-preview',
            system_instruction=system_instruction
        )

        print(f"      [API] Gemini API 요청 중... (최대 {max_chars}자, 구간 {duration_sec:.1f}초)")
        t_api = time.time()
        response = model.generate_content(prompt_contents)
        elapsed = time.time() - t_api
        raw = response.text.strip()
        print(f"      [API] 응답 수신 완료 (소요: {elapsed:.1f}초)")

        usage = response.usage_metadata
        print(f"      [TOKEN] 입력: {usage.prompt_token_count} | 출력: {usage.candidates_token_count} | 합계: {usage.total_token_count}")

        print(f"      [API] 원본 응답: {raw}")

        # JSON 파싱 시도
        json_str = raw
        if "```" in json_str:
            json_str = re.sub(r"```(?:json)?", "", json_str).strip()
        lines = json.loads(json_str)
        total_chars = sum(len(l["text"]) for l in lines)
        print(f"      [API] 파싱 완료: {len(lines)}개 문장, 총 {total_chars}자/{max_chars}자")
        return lines, usage.prompt_token_count, usage.candidates_token_count

    finally:
        if uploaded_files:
            print(f"      [API] 업로드 파일 {len(uploaded_files)}개 삭제 중...")
        for f in uploaded_files:
            try:
                genai.delete_file(f.name)
                print(f"      [API]   삭제 완료: {f.name}")
            except Exception as e:
                print(f"      [WARN] 파일 삭제 실패: {f.name} ({e})")


def process_segment(i, seg, total):
    idx = seg["index"]
    start = seg["start"]
    end = seg["end"]
    duration = seg["duration"]
    keyframes = seg["keyframes"]
    video_before = seg["video_before"]
    video_after = seg["video_after"]
    info_file = seg.get("info_file")

    print(f"[{i+1}/{total}] 구간 {idx} ({start:.1f}~{end:.1f}초, 길이: {duration:.1f}초) 해설 생성 시작")
    seg_start = time.time()
    try:
        script, input_tokens, output_tokens = generate_ad_script_from_video(
            duration, video_before, video_after, keyframes, info_file,
        )
        elapsed = time.time() - seg_start
        print(f"   ★ 구간 {idx} 완료 ({elapsed:.1f}초 소요): {script}")
        return {
            "index": idx,
            "start": start,
            "end": end,
            "duration": duration,
            "script": script,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        }
    except Exception as e:
        print(f"   [오류] API 호출 실패 (구간 {idx}): {e}")
        return None


def main():
    if not os.path.exists(INPUT_JSON):
        print(f"[오류] {INPUT_JSON} 파일이 없습니다. 먼저 preprocess.py를 실행하세요.")
        return

    with open(INPUT_JSON, "r", encoding="utf-8") as f:
        preprocess_data = json.load(f)

    total_duration = preprocess_data["total_duration"]
    segments = preprocess_data["segments"]

    print(f"\n총 {len(segments)}개 구간에 대해 Gemini API 해설 생성 시작... (동시 {MAX_WORKERS}개)")
    print(f"   입력 파일: {INPUT_JSON} | 총 영상 길이: {total_duration:.1f}초\n")

    result_segments = []
    total_start = time.time()

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {
            executor.submit(process_segment, i, seg, len(segments)): seg
            for i, seg in enumerate(segments)
        }
        for future in as_completed(futures):
            result = future.result()
            if result is not None:
                result_segments.append(result)

    result_segments.sort(key=lambda x: x["index"])

    total_input_tokens = sum(s["input_tokens"] for s in result_segments)
    total_output_tokens = sum(s["output_tokens"] for s in result_segments)
    print(f"\n[TOKEN 집계] 입력: {total_input_tokens:,} | 출력: {total_output_tokens:,} | 합계: {total_input_tokens + total_output_tokens:,}")

    output_data = {
        "total_duration": total_duration,
        "segments": result_segments,
    }

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    total_elapsed = time.time() - total_start
    print(f"\n✅ 해설 대본 생성 완료: {len(result_segments)}/{len(segments)}개 구간 → {OUTPUT_JSON} (총 소요: {total_elapsed:.1f}초)")


if __name__ == "__main__":
    main()
