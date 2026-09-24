import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";
import { appDataSource } from "../typeorm.config";

export const createUpdootLoader = new DataLoader<
  { userId: number; postId: number },
  Updoot
>(async keys => {
    const conditions = keys
    .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
    .join(", ");

  const params = keys.flatMap(k => [k.userId, k.postId]);

  const updoots: Updoot[] = await appDataSource.query(
    `
      SELECT * FROM updoot
      WHERE ("userId", "postId") IN (${conditions})
    `,
    params
  );

  const updootIdsToUpdoot: Record<string, Updoot> = {};
  updoots.forEach((updoot) => {
    updootIdsToUpdoot[`${updoot.userId}###${updoot.postId}`] = updoot;
  });

  return keys.map((key) => updootIdsToUpdoot[`${key.userId}###${key.postId}`]);
});
