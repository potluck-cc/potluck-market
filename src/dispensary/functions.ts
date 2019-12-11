import { appsyncFetch, OperationType } from "@potluckmarket/ella";
import { FindStoreByMetadata } from "queries";
import AWSAppSyncClient from "aws-appsync";
import { NormalizedCacheObject } from "apollo-cache-inmemory";

export async function getStoreWithMetadata({
  onSuccess = () => {},
  onFailure = () => {},
  client,
  metadata
}: {
  onSuccess: (store: import("@potluckmarket/types").Store) => any;
  onFailure?: (error?) => any;
  metadata: string;
  client: AWSAppSyncClient<NormalizedCacheObject>;
}) {
  try {
    const { getStoreByMetadata } =
      (await appsyncFetch({
        client,
        operationType: OperationType.query,
        document: FindStoreByMetadata,
        variables: {
          metadata
        }
      })) || null;

    if (getStoreByMetadata) {
      onSuccess(getStoreByMetadata);
    } else {
      onFailure();
    }
  } catch {
    onFailure();
  }
}
