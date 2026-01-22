import { Router } from "express"
import { contactsController } from "../controllers/contacts-controller"

const router = Router()

router.get("/", contactsController.list)
router.get("/search", contactsController.search)
router.get("/stats", contactsController.stats)
router.get("/mining-status", contactsController.getMiningStatus)
router.put("/mining-status", contactsController.setMiningStatus)
router.post("/sync", contactsController.syncContacts)
router.post("/sync/async", contactsController.syncContactsAsync)
router.get("/:id", contactsController.getOne)
router.patch("/:id", contactsController.update)
router.delete("/:id", contactsController.remove)

export default router
