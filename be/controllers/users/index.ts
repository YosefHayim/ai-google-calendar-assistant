export { authController } from "./auth-controller";
export { googleIntegrationController } from "./google-integration-controller";
export { profileController } from "./profile-controller";

export const userController = {
  ...require("./auth-controller").authController,
  ...require("./profile-controller").profileController,
  ...require("./google-integration-controller").googleIntegrationController,
};
