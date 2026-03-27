import { createContext, useContext, useState, ReactNode, FunctionComponent } from "react";

export type ArchiveItem = {
  id: string;
  title: string;
  type: "url" | "file";
  url?: string;
  fileName?: string;
  audioFileName: string;
  audioSize: string;
  date: string;
  liked: boolean;
};

type AppContextType = {
  archiveItems: ArchiveItem[];
  addArchiveItem: (item: Omit<ArchiveItem, "id" | "date" | "liked" | "audioFileName" | "audioSize">) => ArchiveItem;
  toggleLike: (id: string) => void;
  currentItem: ArchiveItem | null;
  setCurrentItem: (item: ArchiveItem | null) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>([]);
  const [currentItem, setCurrentItem] = useState<ArchiveItem | null>(null);

  const addArchiveItem = (item: Omit<ArchiveItem, "id" | "date" | "liked" | "audioFileName" | "audioSize">) => {
    const newItem: ArchiveItem = {
      ...item,
      id: Date.now().toString(),
      date: new Date().toLocaleString("ko-KR"),
      liked: false,
      audioFileName: "smartadv_audio.wav",
      audioSize: "12MB",
    };
    setArchiveItems((prev) => [newItem, ...prev]);
    setCurrentItem(newItem);
    return newItem;
  };

  const toggleLike = (id: string) => {
    setArchiveItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, liked: !item.liked } : item
      )
    );
  };

  return (
    <AppContext.Provider value={{ archiveItems, addArchiveItem, toggleLike, currentItem, setCurrentItem }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
