import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import Achievement from "../models/Achievement.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= EXCEL REPORT =================
export const downloadExcelReport = async (req, res) => {
  try {
    const { year } = req.query;

    const currentYear = new Date().getFullYear();

    const selectedYear = year || currentYear;

    let data = await Achievement.find({
      status: "approved",

      createdAt: {
        $gte: new Date(`${selectedYear}-01-01`),

        $lt: new Date(
          `${Number(selectedYear) + 1}-01-01`
        ),
      },
    });

    // SORT
    data.sort((a, b) => {
      if (
        a.role === "student" &&
        b.role === "faculty"
      )
        return -1;

      if (
        a.role === "faculty" &&
        b.role === "student"
      )
        return 1;

      return 0;
    });

    const workbook = new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet("Achievements");

    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },

      { header: "Role", key: "role", width: 15 },

      {
        header: "PRN / EmpID",
        key: "id",
        width: 20,
      },

      {
        header: "Department",
        key: "department",
        width: 20,
      },

      { header: "Event", key: "event", width: 25 },

      {
        header: "Achievement",
        key: "achievement",
        width: 30,
      },

      {
        header: "Description",
        key: "description",
        width: 30,
      },

      {
        header: "Certificate",
        key: "certificate",
        width: 40,
      },

      { header: "Year", key: "year", width: 10 },
    ];

    if (data.length === 0) {
      worksheet.addRow({
        name: "No data found",
        year: selectedYear,
      });
    } else {

      // ================= STUDENTS =================

      worksheet.addRow({
        name: "=== STUDENT ACHIEVEMENTS ===",
      });

      data
        .filter((item) => item.role === "student")
        .forEach((item) => {
          worksheet.addRow({
            name: item.name,

            role: item.role,

            id: item.prn || "-",

            department:
              item.department || "-",

            event: item.event || "-",

            achievement:
              item.achievementType || "-",

            description:
              item.description ||
              item.details ||
              "-",

            certificate:
              item.certificate || "No File",

            year: new Date(
              item.createdAt
            ).getFullYear(),
          });
        });

      // ================= FACULTY =================

      worksheet.addRow({});

      worksheet.addRow({
        name: "=== FACULTY ACHIEVEMENTS ===",
      });

      data
        .filter((item) => item.role === "faculty")
        .forEach((item) => {
          worksheet.addRow({
            name: item.name,

            role: item.role,

            id: item.empId || "-",

            department:
              item.department || "-",

            event: item.event || "-",

            achievement:
              item.achievementType || "-",

            description:
              item.description ||
              item.details ||
              "-",

            certificate:
              item.certificate || "No File",

            year: new Date(
              item.createdAt
            ).getFullYear(),
          });
        });
    }

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

    console.error(error);

    res.status(500).json({
      message:
        "Error generating Excel report",
    });
  }
};

// ================= PDF REPORT =================
export const downloadPDFReport = async (req, res) => {
  try {

    const { year } = req.query;

    const currentYear = new Date().getFullYear();

    const selectedYear = year || currentYear;

    let data = await Achievement.find({
      status: "approved",

      createdAt: {
        $gte: new Date(`${selectedYear}-01-01`),

        $lt: new Date(
          `${Number(selectedYear) + 1}-01-01`
        ),
      },
    });

    // SORT
    data.sort((a, b) => {

      if (
        a.role === "student" &&
        b.role === "faculty"
      )
        return -1;

      if (
        a.role === "faculty" &&
        b.role === "student"
      )
        return 1;

      return 0;
    });

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

    // ================= LOGO =================

    const logoPath = path.join(
      __dirname,
      "../uploads/logo svkm.jpg"
    );

    try {

      doc.image(logoPath, 50, 30, {
        width: 70,
      });

    } catch (err) {

      console.log("Logo not found");
    }

     // ================= HEADER =================

doc
  .fontSize(20)
  .fillColor("blue")
  .text(
    "SVKM'S Institute of Technology, Dhule",
    120,
    40,
    {
      width: 350,
      align: "center",
    }
  );

doc
  .fontSize(14)
  .fillColor("black")
  .text(
    "Student & Faculty Achievement Report",
    120,
    70,
    {
      width: 350,
      align: "center",
    }
  );

doc
  .fontSize(12)
  .text(
    `Academic Year: ${selectedYear}`,
    120,
    95,
    {
      width: 350,
      align: "center",
    }
  );

// ================= START CONTENT =================

doc.x = 40;
doc.y = 150;

    if (data.length === 0) {

      doc
        .fontSize(14)
        .fillColor("red")
        .text(
          "No approved achievements found."
        );

    } else {

      // ================= STUDENT SECTION =================

      doc
        .fontSize(16)
        .fillColor("green")
        .text("STUDENT ACHIEVEMENTS", {
          align: "left",
        });

      doc.moveDown();

      const students = data.filter(
        (item) => item.role === "student"
      );

      students.forEach((item, index) => {

        doc
          .fontSize(14)
          .fillColor("black")
          .text(
            `${index + 1}. ${
              item.event || "-"
            }`
          );

        doc.moveDown(0.5);

        doc.text(
          `Name: ${item.name || "-"}`
        );

        doc.text(
          `PRN: ${item.prn || "-"}`
        );

        doc.text(
          `Department: ${
            item.department || "-"
          }`
        );

        doc.text(
          `Achievement: ${
            item.achievementType || "-"
          }`
        );

        doc.text(
          `Description: ${
            item.description ||
            item.details ||
            "-"
          }`
        );

        doc.moveDown();

        // ================= CERTIFICATE =================

        if (item.certificate) {

          try {

            const imagePath =
              item.certificate.replace(
                "http://localhost:5000",
                "."
              );

            doc
              .fontSize(12)
              .fillColor("blue")
              .text("Certificate:");

            doc.moveDown(0.5);

            doc.image(imagePath, {
              fit: [250, 180],
              align: "left",
            });

            doc.moveDown();

          } catch (err) {

            doc
              .fontSize(11)
              .fillColor("red")
              .text(
                "Certificate image not found"
              );
          }
        }

        doc.moveDown();

        // ================= LINE =================

        doc
          .strokeColor("gray")
          .lineWidth(1)
          .moveTo(40, doc.y)
          .lineTo(550, doc.y)
          .stroke();

        doc.moveDown(2);
      });

      // ================= FACULTY SECTION =================

      doc.addPage();

      doc
        .fontSize(16)
        .fillColor("green")
        .text("FACULTY ACHIEVEMENTS", {
          align: "left",
        });

      doc.moveDown();

      const faculty = data.filter(
        (item) => item.role === "faculty"
      );

      faculty.forEach((item, index) => {

        doc
          .fontSize(14)
          .fillColor("black")
          .text(
            `${index + 1}. ${
              item.event || "-"
            }`
          );

        doc.moveDown(0.5);

        doc.text(
          `Name: ${item.name || "-"}`
        );

        doc.text(
          `Employee ID: ${
            item.empId || "-"
          }`
        );

        doc.text(
          `Department: ${
            item.department || "-"
          }`
        );

        doc.text(
          `Achievement: ${
            item.achievementType || "-"
          }`
        );

        doc.text(
          `Description: ${
            item.description ||
            item.details ||
            "-"
          }`
        );

        doc.moveDown();

        // ================= CERTIFICATE =================

        if (item.certificate) {

          try {

            const imagePath =
              item.certificate.replace(
                "http://localhost:5000",
                "."
              );

            doc
              .fontSize(12)
              .fillColor("blue")
              .text("Certificate:");

            doc.moveDown(0.5);

            doc.image(imagePath, {
              fit: [250, 180],
              align: "left",
            });

            doc.moveDown();

          } catch (err) {

            doc
              .fontSize(11)
              .fillColor("red")
              .text(
                "Certificate image not found"
              );
          }
        }

        doc.moveDown();

        // ================= LINE =================

        doc
          .strokeColor("gray")
          .lineWidth(1)
          .moveTo(40, doc.y)
          .lineTo(550, doc.y)
          .stroke();

        doc.moveDown(2);
      });
    }

    doc.end();

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error generating PDF report",
    });
  }
};