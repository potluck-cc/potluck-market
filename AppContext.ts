import { createContext, Dispatch } from "react";
import AWSAppSyncClient from "aws-appsync";
import { NormalizedCacheObject } from "apollo-cache-inmemory";

export interface AppContextInterface {
  currentAuthenticatedUser:
    | import("@potluckmarket/louis").User
    | import("@potluckmarket/louis").Doctor
    | null;
  setCurrentAuthenticatedUser: Dispatch<any>;
  initializeApp: (currentUser?) => Promise<void>;
  client: AWSAppSyncClient<NormalizedCacheObject>;
}

export default createContext<AppContextInterface | null>(null);
