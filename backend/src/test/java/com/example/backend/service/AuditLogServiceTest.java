package com.example.backend.service;

import com.example.backend.dto.AuditLogResponse;
import com.example.backend.entity.AuditLog;
import com.example.backend.repository.AuditLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditLogService auditLogService;

    @Test
    void logAction_SavesLogSuccessfully() {
        auditLogService.logAction("TEST_ACTION", "Details", "admin@test.com", "target-1");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());

        AuditLog saved = captor.getValue();
        assertEquals("TEST_ACTION", saved.getAction());
        assertEquals("Details", saved.getDetails());
        assertEquals("admin@test.com", saved.getPerformedBy());
        assertEquals("target-1", saved.getEntityId());
    }

    @Test
    void getAllLogs_ReturnsMappedResponses() {
        AuditLog log = AuditLog.builder()
                .id("log-1")
                .action("ACTION")
                .details("Det")
                .performedBy("user")
                .build();

        when(auditLogRepository.findAllByOrderByTimestampDesc()).thenReturn(List.of(log));

        List<AuditLogResponse> responses = auditLogService.getAllLogs();
        
        assertEquals(1, responses.size());
        assertEquals("log-1", responses.get(0).getId());
        assertEquals("ACTION", responses.get(0).getAction());
    }
}
