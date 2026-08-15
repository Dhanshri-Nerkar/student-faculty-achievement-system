import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import Achievement from "../models/Achievement.js";
import path from "path";
import { fileURLToPath } from "url";

// ================= PATH SETUP =================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= DOWNLOAD CLOUDINARY IMAGE =================

const downloadImage = async (url) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to download image: ${response.status}`
      );
    }

    const contentType =
      response.headers.get("content-type") || "";

    // Only image certificates are supported
    if (!contentType.startsWith("image/")) {
      throw new Error(
        `Certificate is not an image: ${contentType}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    return Buffer.from(arrayBuffer);

  } catch (error) {
    console.error(
      "CERTIFICATE DOWNLOAD ERROR:",
      error.message
    );

    return null;
  }
};

// ============================================================
// EXCEL REPORT
// ============================================================

export const downloadExcelReport = async (req, res) => {
  try {
    const { year } = req.query;

    const currentYear = new Date().getFullYear();
    const selectedYear = year || currentYear;

    // ================= GET APPROVED DATA =================

    let data = await Achievement.find({
      status: "approved",

      createdAt: {
        $gte: new Date(`${selectedYear}-01-01`),

        $lt: new Date(
          `${Number(selectedYear) + 1}-01-01`
        ),
      },
    });

    // ================= STUDENTS FIRST =================

    data.sort((a, b) => {
      if (
        a.role === "student" &&
        b.role === "faculty"
      ) {
        return -1;
      }

      if (
        a.role === "faculty" &&
        b.role === "student"
      ) {
        return 1;
      }

      return 0;
    });

    // ================= CREATE WORKBOOK =================

    const workbook = new ExcelJS.Workbook();

    // ====================================================
    // STUDENT SHEET
    // ====================================================

    const studentWorksheet =
      workbook.addWorksheet(
        "Student Achievements"
      );

    studentWorksheet.columns = [
      {
        header: "Name",
        key: "name",
        width: 20,
      },

      {
        header: "Email",
        key: "email",
        width: 30,
      },

      {
        header: "PRN",
        key: "prn",
        width: 20,
      },

      {
        header: "Department",
        key: "department",
        width: 20,
      },

      {
        header: "Class",
        key: "class",
        width: 15,
      },

      {
        header: "Event",
        key: "event",
        width: 25,
      },

      {
        header: "Achievement Type",
        key: "achievement",
        width: 30,
      },

      {
        header: "Description",
        key: "description",
        width: 40,
      },

      {
        header: "Details",
        key: "details",
        width: 40,
      },

      {
        header: "Certificate",
        key: "certificate",
        width: 20,
      },
    ];

    // ================= STUDENT DATA =================

    const students = data.filter(
      (item) => item.role === "student"
    );

    if (students.length === 0) {

      studentWorksheet.addRow({
        name: "No approved student achievements found",
      });

    } else {

      students.forEach((item) => {

        studentWorksheet.addRow({

          name: item.name || "-",

          email: item.email || "-",

          prn: item.prn || "-",

          department:
            item.department || "-",

          class:
            item.class || "-",

          event:
            item.event || "-",

          achievement:
            item.achievementType || "-",

          description:
            item.description || "-",

          details:
            item.details || "-",

          certificate: item.certificate
            ? {
                text: "View Certificate",
                hyperlink: item.certificate,
              }
            : "No File",
        });

      });
    }

    // ====================================================
    // FACULTY SHEET
    // ====================================================

    const facultyWorksheet =
      workbook.addWorksheet(
        "Faculty Achievements"
      );

    facultyWorksheet.columns = [

      {
        header: "Name",
        key: "name",
        width: 20,
      },

      {
        header: "Email",
        key: "email",
        width: 30,
      },

      {
        header: "Emp ID",
        key: "empId",
        width: 20,
      },

      {
        header: "Department",
        key: "department",
        width: 20,
      },

      {
        header: "Event",
        key: "event",
        width: 25,
      },

      {
        header: "Achievement Type",
        key: "achievement",
        width: 30,
      },

      {
        header: "Description",
        key: "description",
        width: 40,
      },

      {
        header: "Details",
        key: "details",
        width: 40,
      },

      {
        header: "Certificate",
        key: "certificate",
        width: 20,
      },
    ];

    // ================= FACULTY DATA =================

    const faculty = data.filter(
      (item) => item.role === "faculty"
    );

    if (faculty.length === 0) {

      facultyWorksheet.addRow({
        name: "No approved faculty achievements found",
      });

    } else {

      faculty.forEach((item) => {

        facultyWorksheet.addRow({

          name: item.name || "-",

          email: item.email || "-",

          empId: item.empId || "-",

          department:
            item.department || "-",

          event:
            item.event || "-",

          achievement:
            item.achievementType || "-",

          description:
            item.description || "-",

          details:
            item.details || "-",

          certificate: item.certificate
            ? {
                text: "View Certificate",
                hyperlink: item.certificate,
              }
            : "No File",
        });

      });
    }

    // ================= RESPONSE =================

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=achievement_report_${selectedYear}.xlsx`
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (error) {

    console.error(
      "EXCEL ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Error generating Excel report",
    });
  }
};

// ============================================================
// PDF REPORT
// ============================================================

export const downloadPDFReport = async (req, res) => {

  try {

    const { year } = req.query;

    const currentYear =
      new Date().getFullYear();

    const selectedYear =
      year || currentYear;

    // ================= GET APPROVED DATA =================

    let data = await Achievement.find({

      status: "approved",

      createdAt: {

        $gte:
          new Date(`${selectedYear}-01-01`),

        $lt:
          new Date(
            `${Number(selectedYear) + 1}-01-01`
          ),
      },

    });

    // ================= SORT =================

    data.sort((a, b) => {

      if (
        a.role === "student" &&
        b.role === "faculty"
      ) {
        return -1;
      }

      if (
        a.role === "faculty" &&
        b.role === "student"
      ) {
        return 1;
      }

      return 0;
    });

    // ================= CREATE PDF =================

    const doc = new PDFDocument({

      margin: 40,

      size: "A4",

    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=achievement_report_${selectedYear}.pdf`
    );

    doc.pipe(res);

    // ====================================================
    // COLLEGE LOGO
    // ====================================================

    const logoPath = path.join(
      __dirname,
      "../assets/logo-svkm.jpg"
    );

    try {

      doc.image(
        logoPath,
        50,
        30,
        {
          width: 70,
        }
      );

    } catch (error) {

      console.error(
        "COLLEGE LOGO ERROR:",
        error.message
      );

    }

    // ====================================================
    // HEADER
    // ====================================================

    doc
      .fontSize(20)
      .fillColor("blue")
      .text(
        "SVKM'S Institute of Technology, Dhule",
        40,
        40,
        {
          width: 515,
          align: "center",
        }
      );

    doc
      .fontSize(14)
      .fillColor("black")
      .text(
        "Student & Faculty Achievement Report",
        40,
        70,
        {
          width: 515,
          align: "center",
        }
      );

    doc
      .fontSize(12)
      .text(
        `Academic Year: ${selectedYear}`,
        40,
        95,
        {
          width: 515,
          align: "center",
        }
      );

    // ================= START CONTENT =================

    doc.x = 40;
    doc.y = 150;

    // ====================================================
    // NO DATA
    // ====================================================

    if (data.length === 0) {

      doc
        .fontSize(14)
        .fillColor("red")
        .text(
          "No approved achievements found."
        );

      doc.end();

      return;
    }

    // ====================================================
    // STUDENT ACHIEVEMENTS
    // ====================================================

    doc
      .fontSize(16)
      .fillColor("green")
      .text(
        "STUDENT ACHIEVEMENTS",
        {
          align: "left",
        }
      );

    doc.moveDown();

    const students = data.filter(
      (item) => item.role === "student"
    );

    if (students.length === 0) {

      doc
        .fontSize(12)
        .fillColor("black")
        .text(
          "No approved student achievements found."
        );

      doc.moveDown(2);

    } else {

      for (
        const [index, item]
        of students.entries()
      ) {

        // ================= PAGE CHECK =================

        if (doc.y > 650) {
          doc.addPage();
        }

        // ================= TITLE =================

        doc
          .fontSize(14)
          .fillColor("black")
          .text(
            `${index + 1}. ${
              item.event || "-"
            }`
          );

        doc.moveDown(0.5);

        // ================= STUDENT DETAILS =================

        doc
          .fontSize(11)
          .fillColor("black");

        doc.text(
          `Name: ${
            item.name || "-"
          }`
        );

        doc.text(
          `Email: ${
            item.email || "-"
          }`
        );

        doc.text(
          `PRN: ${
            item.prn || "-"
          }`
        );

        doc.text(
          `Department: ${
            item.department || "-"
          }`
        );

        doc.text(
          `Class: ${
            item.class || "-"
          }`
        );

        doc.text(
          `Event: ${
            item.event || "-"
          }`
        );

        doc.text(
          `Achievement Type: ${
            item.achievementType || "-"
          }`
        );

        doc.text(
          `Description: ${
            item.description || "-"
          }`
        );

        doc.text(
          `Details: ${
            item.details || "-"
          }`
        );

        doc.moveDown();

        // =================================================
        // CERTIFICATE
        // =================================================

        if (item.certificate) {

          doc
            .fontSize(12)
            .fillColor("blue")
            .text("Certificate:");

          doc.moveDown(0.5);

          const imageBuffer =
            await downloadImage(
              item.certificate
            );

          if (imageBuffer) {

            try {

              doc.image(
                imageBuffer,
                {
                  fit: [250, 180],
                  align: "left",
                }
              );

              doc.moveDown();

            } catch (error) {

              console.error(
                "PDF IMAGE ERROR:",
                error.message
              );

              doc
                .fontSize(11)
                .fillColor("red")
                .text(
                  "Certificate image could not be added."
                );
            }

          } else {

            doc
              .fontSize(11)
              .fillColor("red")
              .text(
                "Certificate image not available."
              );
          }

        } else {

          doc
            .fontSize(11)
            .fillColor("gray")
            .text(
              "No certificate uploaded."
            );
        }

        doc.moveDown();

        // ================= SEPARATOR =================

        doc
          .strokeColor("gray")
          .lineWidth(1)
          .moveTo(40, doc.y)
          .lineTo(550, doc.y)
          .stroke();

        doc.moveDown(2);
      }
    }

    // ====================================================
    // FACULTY ACHIEVEMENTS
    // ====================================================

    const faculty = data.filter(
      (item) => item.role === "faculty"
    );

    if (faculty.length > 0) {

      doc.addPage();

      doc
        .fontSize(16)
        .fillColor("green")
        .text(
          "FACULTY ACHIEVEMENTS",
          {
            align: "left",
          }
        );

      doc.moveDown();

      for (
        const [index, item]
        of faculty.entries()
      ) {

        // ================= PAGE CHECK =================

        if (doc.y > 650) {
          doc.addPage();
        }

        // ================= TITLE =================

        doc
          .fontSize(14)
          .fillColor("black")
          .text(
            `${index + 1}. ${
              item.event || "-"
            }`
          );

        doc.moveDown(0.5);

        // ================= FACULTY DETAILS =================

        doc
          .fontSize(11)
          .fillColor("black");

        doc.text(
          `Name: ${
            item.name || "-"
          }`
        );

        doc.text(
          `Email: ${
            item.email || "-"
          }`
        );

        doc.text(
          `Emp ID: ${
            item.empId || "-"
          }`
        );

        doc.text(
          `Department: ${
            item.department || "-"
          }`
        );

        doc.text(
          `Event: ${
            item.event || "-"
          }`
        );

        doc.text(
          `Achievement Type: ${
            item.achievementType || "-"
          }`
        );

        doc.text(
          `Description: ${
            item.description || "-"
          }`
        );

        doc.text(
          `Details: ${
            item.details || "-"
          }`
        );

        doc.moveDown();

        // =================================================
        // CERTIFICATE
        // =================================================

        if (item.certificate) {

          doc
            .fontSize(12)
            .fillColor("blue")
            .text("Certificate:");

          doc.moveDown(0.5);

          const imageBuffer =
            await downloadImage(
              item.certificate
            );

          if (imageBuffer) {

            try {

              doc.image(
                imageBuffer,
                {
                  fit: [250, 180],
                  align: "left",
                }
              );

              doc.moveDown();

            } catch (error) {

              console.error(
                "PDF IMAGE ERROR:",
                error.message
              );

              doc
                .fontSize(11)
                .fillColor("red")
                .text(
                  "Certificate image could not be added."
                );
            }

          } else {

            doc
              .fontSize(11)
              .fillColor("red")
              .text(
                "Certificate image not available."
              );
          }

        } else {

          doc
            .fontSize(11)
            .fillColor("gray")
            .text(
              "No certificate uploaded."
            );
        }

        doc.moveDown();

        // ================= SEPARATOR =================

        doc
          .strokeColor("gray")
          .lineWidth(1)
          .moveTo(40, doc.y)
          .lineTo(550, doc.y)
          .stroke();

        doc.moveDown(2);
      }
    }

    // ================= FINISH PDF =================

    doc.end();

  } catch (error) {

    console.error(
      "PDF REPORT ERROR:",
      error
    );

    if (!res.headersSent) {

      res.status(500).json({
        message:
          "Error generating PDF report",
      });
    }
  }
};