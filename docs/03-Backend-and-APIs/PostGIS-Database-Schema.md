---
title: "PostGIS Spatial Database Schema & Geospatial Queries"
tags:
  - bhoomi-mitra
  - backend
  - database
  - postgis
  - sql
  - spatial
date: 2026-09-07
---

# 🗄️ PostGIS Spatial Database Schema & Queries

> **MOC Link**: [[00-Bhoomi-Mitra-MOC|Back to Master Index]]

## 1. Database Overview
Bhoomi Mitra utilizes **PostgreSQL 15+** with the **PostGIS 3.3+** extension to manage cadastral land polygons, infrastructure right-of-way buffers, and spatial intersection calculations.

---

## 2. Table Definitions (DDL)

```sql
-- Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Land Parcels Table
CREATE TABLE land_parcels (
    id SERIAL PRIMARY KEY,
    bhu_aadhar_id VARCHAR(14) UNIQUE NOT NULL,
    state VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    tehsil VARCHAR(50) NOT NULL,
    village VARCHAR(50) NOT NULL,
    khasra_number VARCHAR(30) NOT NULL,
    area_acres NUMERIC(8, 4) NOT NULL,
    land_type VARCHAR(30) DEFAULT 'Agricultural',
    soil_type VARCHAR(50),
    soil_ph NUMERIC(3, 1),
    seller_asking_price_inr NUMERIC(12, 2),
    circle_rate_inr NUMERIC(12, 2),
    geom GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_land_parcels_geom ON land_parcels USING GIST(geom);
CREATE INDEX idx_land_parcels_bhu_aadhar ON land_parcels(bhu_aadhar_id);

-- 2. Land Ownership Registry
CREATE TABLE land_owners (
    id SERIAL PRIMARY KEY,
    bhu_aadhar_id VARCHAR(14) REFERENCES land_parcels(bhu_aadhar_id) ON DELETE CASCADE,
    owner_name VARCHAR(120) NOT NULL,
    owner_email VARCHAR(120),
    owner_mobile VARCHAR(20),
    aadhaar_hash VARCHAR(64),
    ownership_percentage NUMERIC(5, 2) DEFAULT 100.00
);

-- 3. Legal Disputes & Court Cases
CREATE TABLE court_disputes (
    id SERIAL PRIMARY KEY,
    bhu_aadhar_id VARCHAR(14) REFERENCES land_parcels(bhu_aadhar_id),
    case_number VARCHAR(60) NOT NULL,
    court_name VARCHAR(120) NOT NULL,
    filing_year INT NOT NULL,
    case_status VARCHAR(30) NOT NULL, -- 'Active', 'Disposed', 'Stay Order'
    summary TEXT
);

-- 4. Protected Infrastructure & Environmental Zones
CREATE TABLE protected_zones (
    id SERIAL PRIMARY KEY,
    zone_name VARCHAR(120) NOT NULL,
    zone_type VARCHAR(50) NOT NULL, -- 'National Highway Buffer', 'Forest Reserve', 'Waterbody'
    buffer_distance_meters INT DEFAULT 50,
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL
);

CREATE INDEX idx_protected_zones_geom ON protected_zones USING GIST(geom);
```

---

## 3. Spatial Intersection Query (Risk Evaluator)
Calculates percentage overlap between a parcel and any restricted infrastructure or forest buffer:

```sql
SELECT 
    p.bhu_aadhar_id,
    z.zone_name,
    z.zone_type,
    ROUND(
        (ST_Area(ST_Intersection(p.geom::geography, z.geom::geography)) / 
         ST_Area(p.geom::geography) * 100)::numeric, 
        2
    ) AS overlap_percentage
FROM land_parcels p
JOIN protected_zones z ON ST_Intersects(p.geom, z.geom)
WHERE p.bhu_aadhar_id = '14029857364102';
```

---

## 4. Related Notes
- [[GIS-Risk-Assessment|GIS Risk Assessment Algorithm]]
- [[API-Contracts|API Contracts]]
- [[Component-LandMap|LandMap Coordinates Overlay]]
