package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Category {

    @Id
    @Column(length = 255)
    private String id;

    @Column(nullable = false, length = 255)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) this.id = java.util.UUID.randomUUID().toString();
    }
}
