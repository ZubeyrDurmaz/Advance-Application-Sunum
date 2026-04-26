package com.example.backend.repository;

import com.example.backend.entity.Store;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StoreRepository extends JpaRepository<Store, String> {
    List<Store> findByOwner_Id(String ownerId);
    List<Store> findByOwner(User owner);
}
