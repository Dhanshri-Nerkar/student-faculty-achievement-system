import express from "express";
import {
  downloadExcelReport,
  downloadPDFReport
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/report/excel", downloadExcelReport);
router.get("/report/pdf", downloadPDFReport);

export default router;