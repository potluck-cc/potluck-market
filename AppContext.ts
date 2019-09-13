import { createContext, Dispatch } from "react";

export interface AppContextInterface {
  currentAuthenticatedUser:
    | import("@potluckmarket/louis").User
    | import("@potluckmarket/louis").Doctor
    | null;
  setCurrentAuthenticatedUser: Dispatch<any>;
  initializeApp: (currentUser?) => Promise<void>;
}

export default createContext<AppContextInterface | null>(null);
