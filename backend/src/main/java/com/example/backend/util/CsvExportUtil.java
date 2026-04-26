package com.example.backend.util;

import com.example.backend.dto.AuditLogResponse;
import com.example.backend.dto.ProductResponse;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.List;

public class CsvExportUtil {

    public static String exportLogsToCsv(List<AuditLogResponse> logs) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);

        // Header
        pw.println("Timestamp,Action,PerformedBy,TargetID,Details");

        for (AuditLogResponse log : logs) {
            pw.printf("%s,%s,%s,%s,\"%s\"%n",
                    escapeCsv(log.getTimestamp()),
                    escapeCsv(log.getAction()),
                    escapeCsv(log.getPerformedBy()),
                    escapeCsv(log.getEntityId()),
                    escapeCsv(log.getDetails())
            );
        }
        return sw.toString();
    }

    public static String exportProductsToCsv(List<ProductResponse> products) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);

        // Header
        pw.println("ID,SKU,Name,Category,Store,Price,StockQuantity,CreatedAt");

        for (ProductResponse p : products) {
            pw.printf("%s,%s,\"%s\",\"%s\",\"%s\",%s,%d,%s%n",
                    escapeCsv(p.getId()),
                    escapeCsv(p.getSku()),
                    escapeCsv(p.getName()),
                    escapeCsv(p.getCategoryName()),
                    escapeCsv(p.getStoreName()),
                    p.getUnitPrice() != null ? p.getUnitPrice().toString() : "0",
                    p.getStockQuantity() != null ? p.getStockQuantity() : 0,
                    escapeCsv(p.getCreatedAt())
            );
        }
        return sw.toString();
    }

    private static String escapeCsv(String value) {
        if (value == null) return "";
        // Replace quotes with double quotes and remove newlines for simple CSV format
        return value.replace("\"", "\"\"").replace("\n", " ").replace("\r", "");
    }
}
