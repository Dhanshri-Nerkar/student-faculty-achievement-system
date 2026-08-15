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
        $lt: new Date(
          `${Number(selectedYear) + 1}-01-01`
        ),
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

    const worksheet =
      workbook.addWorksheet("Achievements");

    // =================================================
    // EXCEL COLUMNS
    // =================================================

    worksheet.columns = [
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
        header: "PRN / EmpID",
        key: "id",
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
        header: "Details",
        key: "details",
        width: 35,
      },

      {
        header: "Certificate",
        key: "certificate",
        width: 40,
      },
    ];

    // =================================================
    // NO DATA
    // =================================================

    if (data.length === 0) {
      worksheet.addRow({
        name: "No approved achievements found",
      });
    } else {

      // =================================================
      // STUDENT ACHIEVEMENTS
      // =================================================

      worksheet.addRow({
        name: "=== STUDENT ACHIEVEMENTS ===",
      });

      data
        .filter(
          (item) => item.role === "student"
        )
        .forEach((item) => {
          worksheet.addRow({
            name: item.name || "-",

            email: item.email || "-",

            id: item.prn || "-",

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

            details:
              item.details || "-",

            certificate: item.certificate
              ? {
                  text: "View Certificate",
                  hyperlink:
                    item.certificate,
                }
              : "No File",
          });
        });

      // =================================================
      // SPACE
      // =================================================

      worksheet.addRow({});

      // =================================================
      // FACULTY ACHIEVEMENTS
      // =================================================

      worksheet.addRow({
        name: "=== FACULTY ACHIEVEMENTS ===",
      });

      data
        .filter(
          (item) => item.role === "faculty"
        )
        .forEach((item) => {
          worksheet.addRow({
            name: item.name || "-",

            email: item.email || "-",

            id: item.empId || "-",

            department:
              item.department || "-",

            class: "-",

            event:
              item.event || "-",

            achievementType:
              "-",

            description:
              "-",

            details:
              item.details || "-",

            certificate: item.certificate
              ? {
                  text: "View Certificate",
                  hyperlink:
                    item.certificate,
                }
              : "No File",
          });
        });
    }

    // =================================================
    // EXCEL RESPONSE
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

    const currentYear =
      new Date().getFullYear();

    const selectedYear =
      year || currentYear;

    // =================================================
    // GET APPROVED ACHIEVEMENTS
    // =================================================

    let data = await Achievement.find({
      status: "approved",

      createdAt: {
        $gte: new Date(
          `${selectedYear}-01-01`
        ),

        $lt: new Date(
          `${Number(selectedYear) + 1}-01-01`
        ),
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
    // CREATE PDF
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
    // REPORT HEADER
    // =================================================

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

    // =================================================
    // START CONTENT
    // =================================================

    doc.x = 40;
    doc.y = 150;

    // =================================================
    // NO DATA
    // =================================================

    if (data.length === 0) {

      doc
        .fontSize(14)
        .fillColor("red")
        .text(
          "No approved achievements found."
        );

    } else {

      // =================================================
      // STUDENT SECTION
      // =================================================

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

      const students =
        data.filter(
          (item) =>
            item.role === "student"
        );

      // =================================================
      // STUDENT RECORDS
      // =================================================

      for (
        const [index, item] of
        students.entries()
      ) {

        // Prevent content from going
        // too close to bottom
        if (doc.y > 680) {
          doc.addPage();
        }

        // -------------------------------------------------
        // EVENT
        // -------------------------------------------------

        doc
          .fontSize(14)
          .fillColor("black")
          .text(
            `${index + 1}. ${
              item.event || "-"
            }`
          );

        doc.moveDown(0.5);

        // -------------------------------------------------
        // NAME
        // -------------------------------------------------

        doc.text(
          `Name: ${
            item.name || "-"
          }`
        );

        // -------------------------------------------------
        // EMAIL
        // -------------------------------------------------

        doc.text(
          `Email: ${
            item.email || "-"
          }`
        );

        // -------------------------------------------------
        // PRN
        // -------------------------------------------------

        doc.text(
          `PRN: ${
            item.prn || "-"
          }`
        );

        // -------------------------------------------------
        // DEPARTMENT
        // -------------------------------------------------

        doc.text(
          `Department: ${
            item.department || "-"
          }`
        );

        // -------------------------------------------------
        // CLASS
        // -------------------------------------------------

        doc.text(
          `Class: ${
            item.class || "-"
          }`
        );

        // -------------------------------------------------
        // EVENT
        // -------------------------------------------------

        doc.text(
          `Event: ${
            item.event || "-"
          }`
        );

        // -------------------------------------------------
        // ACHIEVEMENT TYPE
        // -------------------------------------------------

        doc.text(
          `Achievement Type: ${
            item.achievementType || "-"
          }`
        );

        // -------------------------------------------------
        // DESCRIPTION
        // -------------------------------------------------

        doc.text(
          `Description: ${
            item.description || "-"
          }`
        );

        // =================================================
        // CERTIFICATE
        // =================================================

        doc.moveDown();

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
                  "Certificate image could not be added"
                );
            }

          } else {

            doc
              .fontSize(11)
              .fillColor("red")
              .text(
                "Certificate image not available"
              );
          }
        }

        // =================================================
        // SEPARATOR LINE
        // =================================================

        doc.moveDown();

        doc
          .strokeColor("gray")
          .lineWidth(1)
          .moveTo(40, doc.y)
          .lineTo(550, doc.y)
          .stroke();

        doc.moveDown(2);
      }

      // =================================================
      // FACULTY SECTION
      // =================================================

      const faculty =
        data.filter(
          (item) =>
            item.role === "faculty"
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

        // =================================================
        // FACULTY RECORDS
        // =================================================

        for (
          const [index, item] of
          faculty.entries()
        ) {

          if (doc.y > 680) {
            doc.addPage();
          }

          // -------------------------------------------------
          // EVENT
          // -------------------------------------------------

          doc
            .fontSize(14)
            .fillColor("black")
            .text(
              `${index + 1}. ${
                item.event || "-"
              }`
            );

          doc.moveDown(0.5);

          // -------------------------------------------------
          // NAME
          // -------------------------------------------------

          doc.text(
            `Name: ${
              item.name || "-"
            }`
          );

          // -------------------------------------------------
          // EMAIL
          // -------------------------------------------------

          doc.text(
            `Email: ${
              item.email || "-"
            }`
          );

          // -------------------------------------------------
          // EMPLOYEE ID
          // -------------------------------------------------

          doc.text(
            `Emp ID: ${
              item.empId || "-"
            }`
          );

          // -------------------------------------------------
          // DEPARTMENT
          // -------------------------------------------------

          doc.text(
            `Department: ${
              item.department || "-"
            }`
          );

          // -------------------------------------------------
          // EVENT
          // -------------------------------------------------

          doc.text(
            `Event: ${
              item.event || "-"
            }`
          );

          // -------------------------------------------------
          // DETAILS
          // -------------------------------------------------

          doc.text(
            `Details: ${
              item.details || "-"
            }`
          );

          // =================================================
          // CERTIFICATE
          // =================================================

          doc.moveDown();

          if (item.certificate) {

            doc
              .fontSize(12)
              .fillColor("blue")
              .text(
                "Certificate:"
              );

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
                    "Certificate image could not be added"
                  );
              }

            } else {

              doc
                .fontSize(11)
                .fillColor("red")
                .text(
                  "Certificate image not available"
                );
            }
          }

          // =================================================
          // SEPARATOR LINE
          // =================================================

          doc.moveDown();

          doc
            .strokeColor("gray")
            .lineWidth(1)
            .moveTo(40, doc.y)
            .lineTo(550, doc.y)
            .stroke();

          doc.moveDown(2);
        }
      }
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