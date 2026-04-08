CREATE TABLE "site_visits" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "site_visits_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ip_address" varchar(45),
	"city" varchar(255),
	"region" varchar(255),
	"country" varchar(255),
	"user_agent" text,
	"path" text,
	"visited_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "enrollments_student_class_unique";--> statement-breakpoint
CREATE INDEX "site_visits_ip_address_idx" ON "site_visits" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "site_visits_visited_at_idx" ON "site_visits" USING btree ("visited_at");--> statement-breakpoint
CREATE INDEX "classes_created_at_idx" ON "classes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "departments_name_idx" ON "departments" USING btree ("name");--> statement-breakpoint
CREATE INDEX "departments_code_idx" ON "departments" USING btree ("code");--> statement-breakpoint
CREATE INDEX "departments_created_at_idx" ON "departments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "subjects_name_idx" ON "subjects" USING btree ("name");--> statement-breakpoint
CREATE INDEX "subjects_code_idx" ON "subjects" USING btree ("code");--> statement-breakpoint
CREATE INDEX "subjects_department_id_idx" ON "subjects" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "subjects_created_at_idx" ON "subjects" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_created_at_idx" ON "user" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "enrollments_student_class_unique" ON "enrollments" USING btree ("student_id","class_id");