package com.assetflow.nexora.entity;
import jakarta.persistence.*; @Entity @Table(name="roles") public class Role { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="role_id") public Short id; @Column(name="role_name",nullable=false,unique=true,length=50) public String name; }
