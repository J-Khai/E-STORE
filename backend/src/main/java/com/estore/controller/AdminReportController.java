package com.estore.controller;

import com.estore.model.Order;
import com.estore.repository.OrderRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.awt.Color;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final OrderRepository orderRepository;

    @GetMapping("/sales")
    public void generateSalesReport(HttpServletResponse response,
                                    @RequestParam(value = "window", defaultValue = "30D") String window) throws IOException, DocumentException {

        // figure out start date
        java.time.LocalDateTime startDate;
        switch (window.toUpperCase()) {
            case "2W": startDate = java.time.LocalDateTime.now().minusWeeks(2); break;
            case "6M": startDate = java.time.LocalDateTime.now().minusMonths(6); break;
            case "1Y": startDate = java.time.LocalDateTime.now().minusYears(1); break;
            case "30D":
            default:   startDate = java.time.LocalDateTime.now().minusDays(30); break;
        }

        // get orders for the report
        List<Order> orders = orderRepository.findByCreatedAtBetween(startDate, java.time.LocalDateTime.now());

        response.setContentType("application/pdf");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"sales-report-" + window + "-" +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + ".pdf\"");

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, new Color(15, 23, 42));
        Font subFont   = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(100, 116, 139));
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
        Font cellFont   = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(30, 41, 59));
        Font paidFont   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(21, 128, 61));
        Font failFont   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(185, 28, 28));

        Paragraph title = new Paragraph("E-STORE  —  Sales Report (" + window.toUpperCase() + ")", titleFont);
        title.setAlignment(Element.ALIGN_LEFT);
        document.add(title);

        Paragraph generatedAt = new Paragraph(
            "Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy  HH:mm")),
            subFont);
        generatedAt.setSpacingBefore(4);
        generatedAt.setSpacingAfter(20);
        document.add(generatedAt);

        // totals at the top
        double totalRevenue = orders.stream()
            .filter(o -> o.getStatus() != null && java.util.Arrays.asList("PAID", "APPROVED", "PROCESSED", "SHIPPED").contains(o.getStatus().name()))
            .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0.0)
            .sum();

        long paidCount = orders.stream()
            .filter(o -> o.getStatus() != null && java.util.Arrays.asList("PAID", "APPROVED", "PROCESSED", "SHIPPED").contains(o.getStatus().name()))
            .count();

        PdfPTable summaryTable = new PdfPTable(3);
        summaryTable.setWidthPercentage(100);
        summaryTable.setSpacingAfter(20);
        summaryTable.setWidths(new float[]{1f, 1f, 1f});

        addSummaryCell(summaryTable, "TOTAL ORDERS", String.valueOf(orders.size()), headerFont);
        addSummaryCell(summaryTable, "PAID ORDERS", String.valueOf(paidCount), headerFont);
        addSummaryCell(summaryTable, "TOTAL REVENUE", String.format("$%.2f", totalRevenue), headerFont);
        document.add(summaryTable);

        // main list of orders
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{0.8f, 2.2f, 1.5f, 1.5f, 1.2f});

        String[] headers = {"ORDER ID", "CUSTOMER EMAIL", "CUSTOMER NAME", "TOTAL", "STATUS"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(new Color(15, 23, 42));
            cell.setPadding(8);
            cell.setBorder(Rectangle.NO_BORDER);
            table.addCell(cell);
        }

        boolean alternate = false;
        for (Order order : orders) {
            Color rowBg = alternate ? new Color(248, 250, 252) : Color.WHITE;
            alternate = !alternate;

            String email  = (order.getUser() != null && order.getUser().getEmail() != null) ? order.getUser().getEmail() : "N/A";
            String name   = (order.getUser() != null) ? (order.getUser().getFirstName() + " " + order.getUser().getLastName()).trim() : "N/A";
            String total  = order.getTotalAmount() != null ? String.format("$%.2f", order.getTotalAmount()) : "$0.00";
            String status = order.getStatus() != null ? order.getStatus().name() : "UNKNOWN";

            addRowCell(table, rowBg, cellFont, String.valueOf(order.getId()));
            addRowCell(table, rowBg, cellFont, email);
            addRowCell(table, rowBg, cellFont, name);
            addRowCell(table, rowBg, cellFont, total);

            boolean isSuccess = java.util.Arrays.asList("PAID", "APPROVED", "PROCESSED", "SHIPPED").contains(status);
            Font statusFont = isSuccess ? paidFont : failFont;
            PdfPCell statusCell = new PdfPCell(new Phrase(status, statusFont));
            statusCell.setBackgroundColor(rowBg);
            statusCell.setPadding(8);
            statusCell.setBorder(Rectangle.NO_BORDER);
            table.addCell(statusCell);
        }

        document.add(table);
        document.close();
    }

    private void addSummaryCell(PdfPTable t, String label, String value, Font labelFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(new Color(241, 245, 249));
        cell.setPadding(12);
        cell.setBorderColor(new Color(226, 232, 240));
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + "\n", labelFont));
        p.add(new Chunk(value, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(15, 23, 42))));
        cell.addElement(p);
        t.addCell(cell);
    }

    private void addRowCell(PdfPTable t, Color bg, Font f, String value) {
        PdfPCell cell = new PdfPCell(new Phrase(value, f));
        cell.setBackgroundColor(bg);
        cell.setPadding(8);
        cell.setBorder(Rectangle.NO_BORDER);
        t.addCell(cell);
    }
}
