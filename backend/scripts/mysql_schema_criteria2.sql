-- NAAC Criteria 2 — MySQL DDL aligned with SQLAlchemy models in backend/models/models.py.
--
-- Example URI:
--   SQLALCHEMY_DATABASE_URI=mysql+pymysql://user:pass@localhost:3306/naac_db
--
-- Prefer `flask shell` + `db.create_all()` after models import so FK order matches your DB.
-- This file is a reference for manual provisioning.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS c21_students_during_year (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enrollment_year VARCHAR(30) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  enrollment_number VARCHAR(120) NOT NULL,
  enrollment_date DATE NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  created_by_id INT NULL,
  updated_by_id INT NULL
);

CREATE TABLE IF NOT EXISTS c22_reserved_seats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year VARCHAR(50) NOT NULL,
  category VARCHAR(80) NOT NULL,
  reserved_seats INT NULL,
  document_link TEXT NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  created_by_id INT NULL,
  updated_by_id INT NULL
);

CREATE TABLE IF NOT EXISTS c233_mentor_meta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mentor_count INT NOT NULL DEFAULT 1,
  academic_year VARCHAR(50) NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  created_by_id INT NULL,
  updated_by_id INT NULL
);

CREATE TABLE IF NOT EXISTS c211_enrolment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  academic_year VARCHAR(20) NOT NULL,
  program_id INT NOT NULL,
  sanctioned_seats INT NULL,
  admitted_students INT NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  created_by_id INT NULL,
  updated_by_id INT NULL,
  CONSTRAINT fk_c211_program FOREIGN KEY (program_id) REFERENCES program_lookup(id)
);

CREATE TABLE IF NOT EXISTS c212_reservation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year VARCHAR(50) NOT NULL,
  earmarked_sc INT NULL,
  earmarked_st INT NULL,
  earmarked_obc INT NULL,
  earmarked_gen INT NULL,
  earmarked_others INT NULL,
  admitted_sc INT NULL,
  admitted_st INT NULL,
  admitted_obc INT NULL,
  admitted_gen INT NULL,
  admitted_others INT NULL,
  supporting_document TEXT NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  created_by_id INT NULL,
  updated_by_id INT NULL
);

CREATE TABLE IF NOT EXISTS c23_outgoing_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year_of_passing VARCHAR(50) NOT NULL,
  student_id INT NOT NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  created_by_id INT NULL,
  updated_by_id INT NULL,
  CONSTRAINT fk_c23_student FOREIGN KEY (student_id) REFERENCES student_lookup(id)
);

CREATE TABLE IF NOT EXISTS c233_mentor_ratio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  academic_year VARCHAR(20) NOT NULL,
  branch VARCHAR(100) NOT NULL,
  first_year_count INT NULL,
  second_year_count INT NULL,
  third_year_count INT NULL,
  fourth_year_count INT NULL,
  total_students INT NULL,
  total_mentors INT NULL,
  mentor_ratio VARCHAR(50) NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  created_by_id INT NULL,
  updated_by_id INT NULL
);

CREATE TABLE IF NOT EXISTS c241_teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  department VARCHAR(255) NULL,
  year_of_appointment INT NULL,
  nature_of_appointment VARCHAR(100) NULL,
  total_years_experience FLOAT NULL,
  is_still_serving TINYINT(1) NULL DEFAULT 1,
  last_year_of_service INT NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  created_by_id INT NULL,
  updated_by_id INT NULL,
  CONSTRAINT fk_c241_teacher FOREIGN KEY (teacher_id) REFERENCES teacher_lookup(id)
);

CREATE TABLE IF NOT EXISTS c242_teacher_phd (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  qualification VARCHAR(100) NULL,
  year_of_obtaining INT NULL,
  number_of_full_time_teachers INT NULL,
  is_still_serving TINYINT(1) NULL DEFAULT 1,
  last_year_of_service INT NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  created_by_id INT NULL,
  updated_by_id INT NULL,
  CONSTRAINT fk_c242_teacher FOREIGN KEY (teacher_id) REFERENCES teacher_lookup(id)
);

CREATE TABLE IF NOT EXISTS c263_pass_percentage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year VARCHAR(50) NOT NULL,
  program_id INT NOT NULL,
  students_appeared INT NULL,
  students_passed INT NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  created_by_id INT NULL,
  updated_by_id INT NULL,
  CONSTRAINT fk_c263_program FOREIGN KEY (program_id) REFERENCES program_lookup(id)
);

-- Existing deployments (run once each if columns missing):
-- ALTER TABLE c241_teachers ADD COLUMN department VARCHAR(255) NULL AFTER teacher_id;
-- ALTER TABLE c242_teacher_phd ADD COLUMN number_of_full_time_teachers INT NULL AFTER year_of_obtaining;
