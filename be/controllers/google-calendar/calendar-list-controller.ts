import type { Request, Response } from "express"
import { reqResAsyncHandler, sendR } from "@/utils/http"
import { STATUS_RESPONSE } from "@/config"

const listCalendars = reqResAsyncHandler(async (req: Request, res: Response) => {
  const r = await req.calendar!.calendarList.list({
    prettyPrint: true,
    minAccessRole: req.query.minAccessRole as string,
    showDeleted: req.query.showDeleted === "true",
    showHidden: req.query.showHidden === "true",
  })

  return sendR(
    res,
    STATUS_RESPONSE.SUCCESS,
    "Successfully retrieved calendar list",
    r.data
  )
})

const getCalendarListEntry = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const r = await req.calendar!.calendarList.get({
      calendarId: req.params.id,
    })

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Successfully retrieved calendar list entry",
      r.data
    )
  }
)

const insertCalendarToList = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const r = await req.calendar!.calendarList.insert({
      requestBody: {
        id: req.body.id,
        colorId: req.body.colorId,
        backgroundColor: req.body.backgroundColor,
        foregroundColor: req.body.foregroundColor,
        hidden: req.body.hidden,
        selected: req.body.selected,
        defaultReminders: req.body.defaultReminders,
        notificationSettings: req.body.notificationSettings,
        summaryOverride: req.body.summaryOverride,
      },
      colorRgbFormat: req.query.colorRgbFormat === "true",
    })

    return sendR(
      res,
      STATUS_RESPONSE.CREATED,
      "Calendar added to list successfully",
      r.data
    )
  }
)

const patchCalendarListEntry = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const r = await req.calendar!.calendarList.patch({
      calendarId: req.params.id,
      requestBody: req.body,
      colorRgbFormat: req.query.colorRgbFormat === "true",
    })

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Calendar list entry patched successfully",
      r.data
    )
  }
)

const updateCalendarListEntry = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const r = await req.calendar!.calendarList.update({
      calendarId: req.params.id,
      requestBody: req.body,
      colorRgbFormat: req.query.colorRgbFormat === "true",
    })

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Calendar list entry updated successfully",
      r.data
    )
  }
)

const deleteCalendarFromList = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    await req.calendar!.calendarList.delete({
      calendarId: req.params.id,
    })

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Calendar removed from list successfully"
    )
  }
)

const watchCalendarList = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const r = await req.calendar!.calendarList.watch({
      requestBody: {
        id: req.body.id,
        type: req.body.type || "web_hook",
        address: req.body.address,
        token: req.body.token,
        expiration: req.body.expiration,
        params: req.body.params,
      },
      minAccessRole: req.query.minAccessRole as string,
      showDeleted: req.query.showDeleted === "true",
      showHidden: req.query.showHidden === "true",
    })

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Calendar list watch created successfully",
      r.data
    )
  }
)

export default {
  listCalendars,
  getCalendarListEntry,
  insertCalendarToList,
  patchCalendarListEntry,
  updateCalendarListEntry,
  deleteCalendarFromList,
  watchCalendarList,
}
