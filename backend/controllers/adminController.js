import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import Achievement from "../models/Achievement.js";

// =====================================================
// DOWNLOAD CLOUDINARY IMAGE
// =====================================================

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

    // PDFKit can directly use image buffers,
    // but cannot use PDF files as images.
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

// =====================================================
// EXCEL REPORT
// =====================================================

export const downloadExcelReport = async (req, res) => {
  try {
    const { year } = req.query;

    const currentYear = new Date().getFullYear();
    const selectedYear = year || currentYear;

    let data = await Achievement.find({
      status: "approved",
      createdAt: {
        $gte: new Date(`${selectedYear}-01-01`),
        $lt: new Date(`${Number(selectedYear) + 1}-01-01`),
      },
    });

    // =================================================
    // SORT STUDENTS FIRST
    // =================================================

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

    const workbook = new ExcelJS.Workbook();

    // =================================================
    // STUDENT SHEET
    // =================================================

    const studentWorksheet =
      workbook.addWorksheet("Student Achievements");

    studentWorksheet.columns = [
      {
        header: "Name",
        key: "name",
        width: 25,
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
        key: "achievementType",
        width: 25,
      },
      {
        header: "Description",
        key: "description",
        width: 35,
      },
      {
        header: "Certificate",
        key: "certificate",
        width: 40,
      },
    ];

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

          achievementType:
            item.achievementType || "-",

          description:
            item.description || "-",

          certificate: item.certificate
            ? {
                text: "View Certificate",
                hyperlink: item.certificate,
              }
            : "No File",
        });
      });
    }

    // =================================================
    // FACULTY SHEET
    // =================================================

    const facultyWorksheet =
      workbook.addWorksheet("Faculty Achievements");

    facultyWorksheet.columns = [
      {
        header: "Name",
        key: "name",
        width: 25,
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
        header: "Details",
        key: "details",
        width: 40,
      },
      {
        header: "Certificate",
        key: "certificate",
        width: 40,
      },
    ];

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

    // =================================================
    // RESPONSE
    // =================================================

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

// =====================================================
// PDF REPORT
// =====================================================

// =====================================================
// PDF REPORT
// =====================================================

export const downloadPDFReport = async (req, res) => {
  try {
    const { year } = req.query;

    const currentYear = new Date().getFullYear();
    const selectedYear = year || currentYear;

    // =================================================
    // GET APPROVED ACHIEVEMENTS
    // =================================================

    let data = await Achievement.find({
      status: "approved",
      createdAt: {
        $gte: new Date(`${selectedYear}-01-01`),
        $lt: new Date(`${Number(selectedYear) + 1}-01-01`),
      },
    });

    // =================================================
    // SORT STUDENTS FIRST
    // =================================================

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

    // =================================================
    // PDF DOCUMENT
    // =================================================

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

    // =================================================
    // PAGE CONSTANTS
    // =================================================

    const PAGE_WIDTH = 595;
    const PAGE_HEIGHT = 842;

    const LEFT_MARGIN = 40;
    const RIGHT_MARGIN = 40;

    const CONTENT_WIDTH =
      PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;

    // Two-column layout
    const LEFT_WIDTH = 320;
    const GAP = 20;
    const RIGHT_WIDTH =
      CONTENT_WIDTH - LEFT_WIDTH - GAP;

    const RIGHT_X =
      LEFT_MARGIN + LEFT_WIDTH + GAP;

    const BOTTOM_MARGIN = 55;

    // =================================================
    // HEADER
    // =================================================

    doc
      .fontSize(20)
      .fillColor("blue")
      .text(
        "SVKM'S Institute of Technology, Dhule",
        LEFT_MARGIN,
        40,
        {
          width: CONTENT_WIDTH,
          align: "center",
        }
      );

    doc
      .fontSize(14)
      .fillColor("black")
      .text(
        "Student & Faculty Achievement Report",
        LEFT_MARGIN,
        70,
        {
          width: CONTENT_WIDTH,
          align: "center",
        }
      );

    doc
      .fontSize(12)
      .text(
        `Academic Year: ${selectedYear}`,
        LEFT_MARGIN,
        95,
        {
          width: CONTENT_WIDTH,
          align: "center",
        }
      );

    // =================================================
    // CONTENT START
    // =================================================

    doc.y = 150;

    // =================================================
    // EMPTY DATA
    // =================================================

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

    // =================================================
    // HELPER: SECTION TITLE
    // =================================================

    const addSectionTitle = (title) => {
      // If section title is too close to bottom
      if (
        doc.y >
        PAGE_HEIGHT - BOTTOM_MARGIN - 80
      ) {
        doc.addPage();
      }

      doc
        .fontSize(16)
        .fillColor("green")
        .text(title, LEFT_MARGIN);

      doc.moveDown(0.8);
    };

    // =================================================
    // HELPER: DRAW LABEL + VALUE
    // =================================================

    const addField = (
      label,
      value,
      x,
      y,
      width
    ) => {
      const text =
        `${label}: ${value || "-"}`;

      doc
        .fontSize(10.5)
        .fillColor("black")
        .text(text, x, y, {
          width: width,
          lineGap: 2,
        });

      return doc.heightOfString(text, {
        width: width,
        lineGap: 2,
      });
    };

    // =================================================
    // HELPER: ADD CERTIFICATE
    // =================================================

    const addCertificate = async (
      certificate,
      x,
      y
    ) => {
      if (!certificate) {
        return 0;
      }

      doc
        .fontSize(11)
        .fillColor("blue")
        .text(
          "Certificate",
          x,
          y,
          {
            width: RIGHT_WIDTH,
          }
        );

      const labelHeight =
        doc.heightOfString(
          "Certificate",
          {
            width: RIGHT_WIDTH,
          }
        );

      const imageY =
        y + labelHeight + 8;

      const imageBuffer =
        await downloadImage(certificate);

      if (!imageBuffer) {
        doc
          .fontSize(9)
          .fillColor("red")
          .text(
            "Certificate image not available",
            x,
            imageY,
            {
              width: RIGHT_WIDTH,
            }
          );

        return (
          labelHeight + 30
        );
      }

      try {
        doc.image(
          imageBuffer,
          x,
          imageY,
          {
            fit: [
              RIGHT_WIDTH,
              210,
            ],
            align: "center",
            valign: "center",
          }
        );

        return (
          labelHeight + 225
        );
      } catch (error) {
        console.error(
          "PDF IMAGE ERROR:",
          error.message
        );

        doc
          .fontSize(9)
          .fillColor("red")
          .text(
            "Certificate image could not be added",
            x,
            imageY,
            {
              width: RIGHT_WIDTH,
            }
          );

        return (
          labelHeight + 30
        );
      }
    };

    // =================================================
    // HELPER: ADD STUDENT ACHIEVEMENT
    // =================================================

    const addStudentAchievement = async (
      item,
      index
    ) => {
      const startY = doc.y;

      // -------------------------------------------------
      // Minimum space required for a new achievement
      // -------------------------------------------------

      if (
        startY >
        PAGE_HEIGHT - BOTTOM_MARGIN - 250
      ) {
        doc.addPage();
      }

      const contentStartY = doc.y;

      // -------------------------------------------------
      // Achievement number
      // -------------------------------------------------

      doc
        .fontSize(13)
        .fillColor("black")
        .text(
          `${index + 1}. ${
            item.event || "-"
          }`,
          LEFT_MARGIN,
          contentStartY,
          {
            width: CONTENT_WIDTH,
          }
        );

      doc.moveDown(0.8);

      const detailsStartY =
        doc.y;

      // -------------------------------------------------
      // LEFT COLUMN
      // -------------------------------------------------

      let leftY = detailsStartY;

      leftY += addField(
        "Name",
        item.name,
        LEFT_MARGIN,
        leftY,
        LEFT_WIDTH
      );

      leftY += 5;

      leftY += addField(
        "Email",
        item.email,
        LEFT_MARGIN,
        leftY,
        LEFT_WIDTH
      );

      leftY += 5;

      leftY += addField(
        "PRN",
        item.prn,
        LEFT_MARGIN,
        leftY,
        LEFT_WIDTH
      );

      leftY += 5;

      leftY += addField(
        "Department",
        item.department,
        LEFT_MARGIN,
        leftY,
        LEFT_WIDTH
      );

      leftY += 5;

      leftY += addField(
        "Class",
        item.class,
        LEFT_MARGIN,
        leftY,
        LEFT_WIDTH
      );

      leftY += 5;

      leftY += addField(
        "Event",
        item.event,
        LEFT_MARGIN,
        leftY,
        LEFT_WIDTH
      );

      leftY += 5;

      leftY += addField(
        "Achievement Type",
        item.achievementType,
        LEFT_MARGIN,
        leftY,
        LEFT_WIDTH
      );

      leftY += 5;

      // -------------------------------------------------
      // DESCRIPTION
      // -------------------------------------------------

      const descriptionText =
        `Description: ${
          item.description || "-"
        }`;

      doc
        .fontSize(10.5)
        .fillColor("black")
        .text(
          descriptionText,
          LEFT_MARGIN,
          leftY,
          {
            width: LEFT_WIDTH,
            lineGap: 3,
          }
        );

      const descriptionHeight =
        doc.heightOfString(
          descriptionText,
          {
            width: LEFT_WIDTH,
            lineGap: 3,
          }
        );

      leftY += descriptionHeight;

      // -------------------------------------------------
      // RIGHT COLUMN - CERTIFICATE
      // -------------------------------------------------

      const certificateHeight =
        await addCertificate(
          item.certificate,
          RIGHT_X,
          detailsStartY
        );

      // -------------------------------------------------
      // DETERMINE END OF ACHIEVEMENT
      // -------------------------------------------------

      const contentEndY =
        Math.max(
          leftY,
          detailsStartY +
            certificateHeight
        );

      doc.y =
        contentEndY + 15;

      // -------------------------------------------------
      // SEPARATOR
      // -------------------------------------------------

      if (
        doc.y >
        PAGE_HEIGHT - BOTTOM_MARGIN
      ) {
        doc.addPage();
      } else {
        doc
          .strokeColor("gray")
          .lineWidth(0.7)
          .moveTo(
            LEFT_MARGIN,
            doc.y
          )
          .lineTo(
            PAGE_WIDTH - RIGHT_MARGIN,
            doc.y
          )
          .stroke();

        doc.moveDown(1.5);
      }
    };

    // =================================================
    // HELPER: ADD FACULTY ACHIEVEMENT
    // =================================================

    const addFacultyAchievement = async (
      item,
      index
    ) => {
      const startY = doc.y;

      // -------------------------------------------------
      // Minimum space for achievement
      // -------------------------------------------------

      if (
        startY >
        PAGE_HEIGHT - BOTTOM_MARGIN - 250
      ) {
        doc.addPage();
      }

      const contentStartY =
        doc.y;

      // -------------------------------------------------
      // Achievement number
      // -------------------------------------------------

      doc
        .fontSize(13)
        .fillColor("black")
        .text(
          `${index + 1}. ${
            item.event || "-"
          }`,
          LEFT_MARGIN,
          contentStartY,
          {
            width: CONTENT_WIDTH,
          }
        );

      doc.moveDown(0.8);

      const detailsStartY =
        doc.y;

      // -------------------------------------------------
      // LEFT COLUMN
      // -------------------------------------------------

      let leftY =
        detailsStartY;

      leftY += addField(
        "Name",
        item.name,
        LEFT_MARGIN,
        leftY,
        LEFT_WIDTH
      );

      leftY += 5;

      leftY += addField(
        "Email",
        item.email,
        LEFT_MARGIN,
        leftY,
        LEFT_WIDTH
      );

      leftY += 5;

      leftY += addField(
        "Employee ID",
        item.empId,
        LEFT_MARGIN,
        leftY,
        LEFT_WIDTH
      );

      leftY += 5;

      leftY += addField(
        "Department",
        item.department,
        LEFT_MARGIN,
        leftY,
        LEFT_WIDTH
      );

      leftY += 5;

      leftY += addField(
        "Event",
        item.event,
        LEFT_MARGIN,
        leftY,
        LEFT_WIDTH
      );

      leftY += 5;

      // -------------------------------------------------
      // DETAILS
      // -------------------------------------------------

      const detailsText =
        `Details: ${
          item.details || "-"
        }`;

      doc
        .fontSize(10.5)
        .fillColor("black")
        .text(
          detailsText,
          LEFT_MARGIN,
          leftY,
          {
            width: LEFT_WIDTH,
            lineGap: 3,
          }
        );

      const detailsHeight =
        doc.heightOfString(
          detailsText,
          {
            width: LEFT_WIDTH,
            lineGap: 3,
          }
        );

      leftY += detailsHeight;

      // -------------------------------------------------
      // RIGHT COLUMN - CERTIFICATE
      // -------------------------------------------------

      const certificateHeight =
        await addCertificate(
          item.certificate,
          RIGHT_X,
          detailsStartY
        );

      // -------------------------------------------------
      // END OF ACHIEVEMENT
      // -------------------------------------------------

      const contentEndY =
        Math.max(
          leftY,
          detailsStartY +
            certificateHeight
        );

      doc.y =
        contentEndY + 15;

      // -------------------------------------------------
      // SEPARATOR
      // -------------------------------------------------

      if (
        doc.y >
        PAGE_HEIGHT - BOTTOM_MARGIN
      ) {
        doc.addPage();
      } else {
        doc
          .strokeColor("gray")
          .lineWidth(0.7)
          .moveTo(
            LEFT_MARGIN,
            doc.y
          )
          .lineTo(
            PAGE_WIDTH - RIGHT_MARGIN,
            doc.y
          )
          .stroke();

        doc.moveDown(1.5);
      }
    };

    // =================================================
    // STUDENT ACHIEVEMENTS
    // =================================================

    const students =
      data.filter(
        (item) =>
          item.role === "student"
      );

    if (students.length > 0) {
      addSectionTitle(
        "STUDENT ACHIEVEMENTS"
      );

      for (
        let i = 0;
        i < students.length;
        i++
      ) {
        await addStudentAchievement(
          students[i],
          i
        );
      }
    }

    // =================================================
    // FACULTY ACHIEVEMENTS
    // =================================================

    const faculty =
      data.filter(
        (item) =>
          item.role === "faculty"
      );

    if (faculty.length > 0) {

      // Start faculty on a fresh page
      doc.addPage();

      addSectionTitle(
        "FACULTY ACHIEVEMENTS"
      );

      for (
        let i = 0;
        i < faculty.length;
        i++
      ) {
        await addFacultyAchievement(
          faculty[i],
          i
        );
      }
    }

    // =================================================
    // FINISH PDF
    // =================================================

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