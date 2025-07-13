import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UIState {
  // State
  sidebarOpen: boolean;
  isMobile: boolean;
  mounted: boolean;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMobile: (mobile: boolean) => void;
  setMounted: (mounted: boolean) => void;
  closeSidebarOnMobile: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      sidebarOpen: true,
      isMobile: false,
      mounted: false,

      // Actions
      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open }, false, "setSidebarOpen");
      },

      toggleSidebar: () => {
        const { sidebarOpen } = get();
        set({ sidebarOpen: !sidebarOpen }, false, "toggleSidebar");
      },

      setMobile: (mobile: boolean) => {
        set(
          {
            isMobile: mobile,
            sidebarOpen: mobile ? false : get().sidebarOpen,
          },
          false,
          "setMobile"
        );
      },

      setMounted: (mounted: boolean) => {
        set({ mounted }, false, "setMounted");
      },

      closeSidebarOnMobile: () => {
        const { isMobile } = get();
        if (isMobile) {
          set({ sidebarOpen: false }, false, "closeSidebarOnMobile");
        }
      },
    }),
    {
      name: "ui-store",
    }
  )
);
