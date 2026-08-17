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
      if (a.role === "student" && b.role === "faculty") {
        return -1;
      }

      if (a.role === "faculty" && b.role === "student") {
        return 1;
      }

      return 0;
    });

    // =================================================
    // CREATE PDF
    // =================================================

    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      bufferPages: true,
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

    // =================================================
    // REPORT HEADER
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

    doc.y = 145;

    // =================================================
    // SECTION TITLE
    // =================================================

    const addSectionTitle = (title) => {
      if (doc.y > 700) {
        doc.addPage();
      }

      doc
        .fontSize(17)
        .fillColor("green")
        .text(title, LEFT_MARGIN);

      doc.moveDown(0.8);
    };

    // =================================================
    // FIELD HELPER
    // =================================================

    const getFieldHeight = (
      label,
      value,
      width
    ) => {
      const text = `${label}: ${value || "-"}`;

      return doc.heightOfString(text, {
        width: width,
        lineGap: 2,
      });
    };

    // =================================================
    // ADD FIELD
    // =================================================

    const addField = (
      label,
      value,
      x,
      y,
      width
    ) => {
      const text = `${label}: ${value || "-"}`;

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
    // CERTIFICATE BOX
    // =================================================

    const addCertificateBox = async (
      certificate,
      x,
      y,
      width,
      height
    ) => {

      // Outer certificate box
      doc
        .roundedRect(
          x,
          y,
          width,
          height,
          6
        )
        .lineWidth(0.8)
        .strokeColor("#999999")
        .stroke();

      // Certificate title
      doc
        .fontSize(10.5)
        .fillColor("blue")
        .text(
          "CERTIFICATE",
          x,
          y + 10,
          {
            width: width,
            align: "center",
          }
        );

      const imageAreaX = x + 8;
      const imageAreaY = y + 32;

      const imageAreaWidth =
        width - 16;

      const imageAreaHeight =
        height - 42;

      if (!certificate) {
        doc
          .fontSize(9)
          .fillColor("gray")
          .text(
            "No certificate uploaded",
            imageAreaX,
            imageAreaY + 40,
            {
              width: imageAreaWidth,
              align: "center",
            }
          );

        return;
      }

      const imageBuffer =
        await downloadImage(certificate);

      if (!imageBuffer) {
        doc
          .fontSize(9)
          .fillColor("red")
          .text(
            "Certificate image not available",
            imageAreaX,
            imageAreaY + 40,
            {
              width: imageAreaWidth,
              align: "center",
            }
          );

        return;
      }

      try {
        doc.image(
          imageBuffer,
          imageAreaX,
          imageAreaY,
          {
            fit: [
              imageAreaWidth,
              imageAreaHeight,
            ],
            align: "center",
            valign: "center",
          }
        );
      } catch (error) {
        console.error(
          "CERTIFICATE IMAGE ERROR:",
          error.message
        );

        doc
          .fontSize(9)
          .fillColor("red")
          .text(
            "Unable to display certificate",
            imageAreaX,
            imageAreaY + 40,
            {
              width: imageAreaWidth,
              align: "center",
            }
          );
      }
    };

    // =================================================
    // STUDENT ACHIEVEMENT CARD
    // =================================================

    const addStudentAchievement = async (
      item,
      index
    ) => {

      // -------------------------------------------------
      // COLUMN WIDTHS
      // -------------------------------------------------

      const cardX = LEFT_MARGIN;

      const cardWidth = CONTENT_WIDTH;

      const cardPadding = 15;

      const leftWidth = 300;

      const dividerGap = 15;

      const rightWidth =
        cardWidth -
        cardPadding * 2 -
        leftWidth -
        dividerGap;

      const rightX =
        cardX +
        cardPadding +
        leftWidth +
        dividerGap;

      // -------------------------------------------------
      // CALCULATE LEFT CONTENT HEIGHT
      // -------------------------------------------------

      const descriptionText =
        `Description: ${
          item.description || "-"
        }`;

      let leftContentHeight = 0;

      leftContentHeight +=
        getFieldHeight(
          "Name",
          item.name,
          leftWidth
        ) + 5;

      leftContentHeight +=
        getFieldHeight(
          "Email",
          item.email,
          leftWidth
        ) + 5;

      leftContentHeight +=
        getFieldHeight(
          "PRN",
          item.prn,
          leftWidth
        ) + 5;

      leftContentHeight +=
        getFieldHeight(
          "Department",
          item.department,
          leftWidth
        ) + 5;

      leftContentHeight +=
        getFieldHeight(
          "Class",
          item.class,
          leftWidth
        ) + 5;

      leftContentHeight +=
        getFieldHeight(
          "Event",
          item.event,
          leftWidth
        ) + 5;

      leftContentHeight +=
        getFieldHeight(
          "Achievement Type",
          item.achievementType,
          leftWidth
        ) + 5;

      leftContentHeight +=
        doc.heightOfString(
          descriptionText,
          {
            width: leftWidth,
            lineGap: 3,
          }
        );

      // -------------------------------------------------
      // CERTIFICATE HEIGHT
      // -------------------------------------------------

      const certificateHeight = 220;

      // -------------------------------------------------
      // CARD HEIGHT
      // -------------------------------------------------

      const titleHeight = 25;

      const cardHeight =
        Math.max(
          leftContentHeight,
          certificateHeight
        ) +
        titleHeight +
        cardPadding * 2;

      // -------------------------------------------------
      // PAGE CHECK
      // -------------------------------------------------

      if (
        doc.y + cardHeight >
        PAGE_HEIGHT - 45
      ) {
        doc.addPage();

        doc.y = 45;
      }

      const cardY = doc.y;

      // -------------------------------------------------
      // OUTER CARD
      // -------------------------------------------------

      doc
        .roundedRect(
          cardX,
          cardY,
          cardWidth,
          cardHeight,
          8
        )
        .lineWidth(0.8)
        .strokeColor("#B5B5B5")
        .stroke();

      // -------------------------------------------------
      // ACHIEVEMENT TITLE
      // -------------------------------------------------

      doc
        .fontSize(13)
        .fillColor("black")
        .text(
          `${index + 1}. ${
            item.event || "-"
          }`,
          cardX + cardPadding,
          cardY + cardPadding,
          {
            width: cardWidth -
              cardPadding * 2,
          }
        );

      // -------------------------------------------------
      // CONTENT START
      // -------------------------------------------------

      const contentY =
        cardY +
        cardPadding +
        titleHeight;

      // -------------------------------------------------
      // VERTICAL DIVIDER
      // -------------------------------------------------

      const dividerX =
        cardX +
        cardPadding +
        leftWidth +
        dividerGap / 2;

      doc
        .moveTo(
          dividerX,
          contentY
        )
        .lineTo(
          dividerX,
          cardY + cardHeight - cardPadding
        )
        .lineWidth(0.6)
        .strokeColor("#D0D0D0")
        .stroke();

      // -------------------------------------------------
      // LEFT CONTENT
      // -------------------------------------------------

      let leftY = contentY;

      leftY +=
        addField(
          "Name",
          item.name,
          cardX + cardPadding,
          leftY,
          leftWidth
        ) + 5;

      leftY +=
        addField(
          "Email",
          item.email,
          cardX + cardPadding,
          leftY,
          leftWidth
        ) + 5;

      leftY +=
        addField(
          "PRN",
          item.prn,
          cardX + cardPadding,
          leftY,
          leftWidth
        ) + 5;

      leftY +=
        addField(
          "Department",
          item.department,
          cardX + cardPadding,
          leftY,
          leftWidth
        ) + 5;

      leftY +=
        addField(
          "Class",
          item.class,
          cardX + cardPadding,
          leftY,
          leftWidth
        ) + 5;

      leftY +=
        addField(
          "Event",
          item.event,
          cardX + cardPadding,
          leftY,
          leftWidth
        ) + 5;

      leftY +=
        addField(
          "Achievement Type",
          item.achievementType,
          cardX + cardPadding,
          leftY,
          leftWidth
        ) + 5;

      // -------------------------------------------------
      // DESCRIPTION
      // -------------------------------------------------

      doc
        .fontSize(10.5)
        .fillColor("black")
        .text(
          descriptionText,
          cardX + cardPadding,
          leftY,
          {
            width: leftWidth,
            lineGap: 3,
          }
        );

      // -------------------------------------------------
      // RIGHT CERTIFICATE
      // -------------------------------------------------

      await addCertificateBox(
        item.certificate,
        rightX,
        contentY,
        rightWidth,
        certificateHeight
      );

      // -------------------------------------------------
      // MOVE BELOW CARD
      // -------------------------------------------------

      doc.y =
        cardY +
        cardHeight +
        15;
    };

    // =================================================
    // FACULTY ACHIEVEMENT CARD
    // =================================================

    const addFacultyAchievement = async (
      item,
      index
    ) => {

      const cardX = LEFT_MARGIN;

      const cardWidth = CONTENT_WIDTH;

      const cardPadding = 15;

      const leftWidth = 300;

      const dividerGap = 15;

      const rightWidth =
        cardWidth -
        cardPadding * 2 -
        leftWidth -
        dividerGap;

      const rightX =
        cardX +
        cardPadding +
        leftWidth +
        dividerGap;

      // -------------------------------------------------
      // DETAILS
      // -------------------------------------------------

      const detailsText =
        `Details: ${
          item.details || "-"
        }`;

      let leftContentHeight = 0;

      leftContentHeight +=
        getFieldHeight(
          "Name",
          item.name,
          leftWidth
        ) + 5;

      leftContentHeight +=
        getFieldHeight(
          "Email",
          item.email,
          leftWidth
        ) + 5;

      leftContentHeight +=
        getFieldHeight(
          "Employee ID",
          item.empId,
          leftWidth
        ) + 5;

      leftContentHeight +=
        getFieldHeight(
          "Department",
          item.department,
          leftWidth
        ) + 5;

      leftContentHeight +=
        getFieldHeight(
          "Event",
          item.event,
          leftWidth
        ) + 5;

      leftContentHeight +=
        doc.heightOfString(
          detailsText,
          {
            width: leftWidth,
            lineGap: 3,
          }
        );

      // -------------------------------------------------
      // CARD HEIGHT
      // -------------------------------------------------

      const certificateHeight = 220;

      const titleHeight = 25;

      const cardHeight =
        Math.max(
          leftContentHeight,
          certificateHeight
        ) +
        titleHeight +
        cardPadding * 2;

      // -------------------------------------------------
      // PAGE CHECK
      // -------------------------------------------------

      if (
        doc.y + cardHeight >
        PAGE_HEIGHT - 45
      ) {
        doc.addPage();

        doc.y = 45;
      }

      const cardY = doc.y;

      // -------------------------------------------------
      // OUTER CARD
      // -------------------------------------------------

      doc
        .roundedRect(
          cardX,
          cardY,
          cardWidth,
          cardHeight,
          8
        )
        .lineWidth(0.8)
        .strokeColor("#B5B5B5")
        .stroke();

      // -------------------------------------------------
      // TITLE
      // -------------------------------------------------

      doc
        .fontSize(13)
        .fillColor("black")
        .text(
          `${index + 1}. ${
            item.event || "-"
          }`,
          cardX + cardPadding,
          cardY + cardPadding,
          {
            width:
              cardWidth -
              cardPadding * 2,
          }
        );

      // -------------------------------------------------
      // CONTENT START
      // -------------------------------------------------

      const contentY =
        cardY +
        cardPadding +
        titleHeight;

      // -------------------------------------------------
      // DIVIDER
      // -------------------------------------------------

      const dividerX =
        cardX +
        cardPadding +
        leftWidth +
        dividerGap / 2;

      doc
        .moveTo(
          dividerX,
          contentY
        )
        .lineTo(
          dividerX,
          cardY + cardHeight - cardPadding
        )
        .lineWidth(0.6)
        .strokeColor("#D0D0D0")
        .stroke();

      // -------------------------------------------------
      // LEFT CONTENT
      // -------------------------------------------------

      let leftY = contentY;

      leftY +=
        addField(
          "Name",
          item.name,
          cardX + cardPadding,
          leftY,
          leftWidth
        ) + 5;

      leftY +=
        addField(
          "Email",
          item.email,
          cardX + cardPadding,
          leftY,
          leftWidth
        ) + 5;

      leftY +=
        addField(
          "Employee ID",
          item.empId,
          cardX + cardPadding,
          leftY,
          leftWidth
        ) + 5;

      leftY +=
        addField(
          "Department",
          item.department,
          cardX + cardPadding,
          leftY,
          leftWidth
        ) + 5;

      leftY +=
        addField(
          "Event",
          item.event,
          cardX + cardPadding,
          leftY,
          leftWidth
        ) + 5;

      // -------------------------------------------------
      // DETAILS
      // -------------------------------------------------

      doc
        .fontSize(10.5)
        .fillColor("black")
        .text(
          detailsText,
          cardX + cardPadding,
          leftY,
          {
            width: leftWidth,
            lineGap: 3,
          }
        );

      // -------------------------------------------------
      // CERTIFICATE
      // -------------------------------------------------

      await addCertificateBox(
        item.certificate,
        rightX,
        contentY,
        rightWidth,
        certificateHeight
      );

      // -------------------------------------------------
      // MOVE BELOW CARD
      // -------------------------------------------------

      doc.y =
        cardY +
        cardHeight +
        15;
    };

    // =================================================
    // STUDENTS
    // =================================================

    const students = data.filter(
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
    // FACULTY
    // =================================================

    const faculty = data.filter(
      (item) =>
        item.role === "faculty"
    );

    if (faculty.length > 0) {

      // Faculty starts on a new page
      doc.addPage();

      doc.y = 45;

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
    // NO DATA
    // =================================================

    if (
      students.length === 0 &&
      faculty.length === 0
    ) {
      doc
        .fontSize(14)
        .fillColor("red")
        .text(
          "No approved achievements found."
        );
    }

    // =================================================
    // END PDF
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