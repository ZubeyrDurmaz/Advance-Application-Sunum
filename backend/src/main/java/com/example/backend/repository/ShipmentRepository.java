package com.example.backend.repository;

import com.example.backend.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, String> {
    Optional<Shipment> findByOrder_Id(String orderId);
}
