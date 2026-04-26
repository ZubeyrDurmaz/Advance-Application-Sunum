package com.example.backend.service;

import com.example.backend.dto.AuditLogResponse;
import com.example.backend.entity.AuditLog;
import com.example.backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void logAction(String action, String details, String performedBy, String entityId) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .details(details)
                .performedBy(performedBy)
                .entityId(entityId)
                .build();
        auditLogRepository.save(log);
    }

    public List<AuditLogResponse> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .action(log.getAction())
                .details(log.getDetails())
                .performedBy(log.getPerformedBy())
                .entityId(log.getEntityId())
                .timestamp(log.getTimestamp() != null ? log.getTimestamp().toString() : null)
                .build();
    }
}
