import { authController } from "./auth-controller";
import { googleIntegrationController } from "./google-integration-controller";
import { profileController } from "./profile-controller";

export { authController } from "./auth-controller";
export { googleIntegrationController } from "./google-integration-controller";
export { profileController } from "./profile-controller";

export const userController = {
  ...authController,
  ...profileController,
  ...googleIntegrationController,
};
