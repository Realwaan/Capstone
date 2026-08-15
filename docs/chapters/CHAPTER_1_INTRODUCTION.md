# Chapter 1: Introduction & Problem Background

**Project Title:** MediScan AI: Multi-Modal Clinical Workflow & Diagnostic Triaging System  
**Authors:** Team Synapse (Alex Vance, Marcus Chen, Sophia Patel, David Kim)  
**Adviser:** Dr. Arthur C. Martinez, Ph.D.  
**Academic Year:** 2026–2027  

---

## 1.1 Background of the Study
Provide an in-depth background of the clinical triaging dilemma in emergency medicine and rural healthcare facilities. Explain the shortage of specialized radiologists during peak hours and the latency incurred between patient intake and radiographic diagnosis.

*Key themes to cover:*
* Global and regional shortage of certified radiologists in primary triage.
* Time-to-treatment delays for acute thoracic conditions (e.g. Tension Pneumothorax, Acute Pulmonary Edema).
* How automated AI-driven clinical workflow decision support bridges the diagnostic bottleneck without replacing physician autonomy.

---

## 1.2 Statement of the Problem
The central problem addressed by this study is the critical delay and subjectivity in emergency chest radiography prioritization in resource-constrained clinics. Specifically, this research seeks to answer the following:

1. **Specific Problem 1:** How can deep learning convolutional and transformer architectures achieve reliable sensitivity (>88%) in detecting multi-class pulmonary abnormalities from standard DICOM chest radiographs?
2. **Specific Problem 2:** How can asynchronous real-time triaging notifications and Grad-CAM interpretability heatmaps be seamlessly integrated into clinicians' existing PACS and web interfaces?
3. **Specific Problem 3:** What is the software quality and usability score of the proposed platform according to clinical practitioners based on the ISO/IEC 25010 standard?

---

## 1.3 Research Objectives

### 1.3.1 General Objective
To design, develop, and evaluate **MediScan AI**, an intelligent multi-modal clinical workflow and diagnostic triaging web platform that automates radiographic anomaly prioritization and facilitates physician decision support.

### 1.3.2 Specific Objectives
1. To preprocess, sanitize, and train deep neural networks on standardized clinical chest radiograph datasets (NIH ChestX-ray14 and MIMIC-CXR).
2. To build an interactive, browser-native DICOM radiological viewer featuring Hounsfield Unit windowing and Grad-CAM visual explanation overlays.
3. To develop an asynchronous WebSocket triage dispatcher that automatically escalates high-risk cases to attending emergency physicians.
4. To evaluate the functional suitability, performance efficiency, usability, and reliability of the platform using ISO/IEC 25010 guidelines with medical professionals.

---

## 1.4 Scope and Delimitation

### In Scope:
* Frontal posterior-anterior (PA) and anterior-posterior (AP) digital chest radiographs in DICOM and standard raster formats.
* Multi-label detection for 8 acute pulmonary conditions (Pneumothorax, Consolidation, Cardiomegaly, Effusion, Atelectasis, Infiltration, Mass, Nodule).
* Web-based clinician portal with role-based access control (Clinician, Radiologist, Admin).
* ISO/IEC 25010 software quality evaluation with a sample size of 10 licensed healthcare practitioners.

### Delimitation:
* Lateral chest projections, 3D CT volumetrics, and MRI scans are excluded in this phase.
* The system serves strictly as a clinical decision-support and prioritization triage tool; it does not replace definitive medical diagnosis by a certified radiologist.

---

## 1.5 Significance of the Study
* **For Healthcare Practitioners:** Reduces cognitive overload and expedites identification of life-threatening anomalies in crowded emergency rooms.
* **For Regional / Rural Clinics:** Bridges diagnostic delays in facilities operating without 24/7 on-site radiologists.
* **For Future Researchers:** Serves as a modular, open-source architectural benchmark for multi-modal medical AI systems adhering to HIPAA audit requirements.
