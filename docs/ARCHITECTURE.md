# 🛡️ SafeGuard Web Portal Architecture

SafeGuard Web is an enterprise Health, Safety, and Environment (HSE) management, investigation, and reporting portal.

---

## 🏛️ System Architecture

```
+-------------------------------------------------------------+
|                     React 19 + Vite SPA                     |
|  (Manager Dashboard, Review Screen, CAPA Kanban, Analytics) |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                   State & Analytics Layer                   |
|       (Recharts, Filter Engines, 5x5 Matrix Evaluator)      |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                     Supabase Backend                        |
|       (PostgreSQL DB, Row-Level Security, S3 Storage)       |
+-------------------------------------------------------------+
```

---

## 📊 Modules & Capabilities

1. **Executive Dashboard**: Key HSE performance metrics, incident trends, category bar charts, and severity donut charts.
2. **Interactive 5x5 Risk Heatmap**: Probability x Severity matrix matching ISO 31000 risk management standards.
3. **Investigation & 5-Whys RCA**: Root cause analysis tracking with evidence photo lightbox.
4. **CAPA Kanban Board**: Corrective & Preventive Action workflow management.
5. **Multi-Facility Benchmarks**: Cross-site safety comparisons.
