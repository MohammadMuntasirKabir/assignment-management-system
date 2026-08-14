using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AssignmentManagement.Data.Migrations
{
    /// <inheritdoc />
    public partial class RestrictUserReferentialActions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assignments_Users_TeacherId",
                table: "Assignments");

            migrationBuilder.DropForeignKey(
                name: "FK_ClassStudents_Users_StudentId",
                table: "ClassStudents");

            migrationBuilder.DropForeignKey(
                name: "FK_Submissions_Users_StudentId",
                table: "Submissions");

            migrationBuilder.DropForeignKey(
                name: "FK_TeacherClassSubjects_Users_TeacherId",
                table: "TeacherClassSubjects");

            migrationBuilder.AddForeignKey(
                name: "FK_Assignments_Users_TeacherId",
                table: "Assignments",
                column: "TeacherId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ClassStudents_Users_StudentId",
                table: "ClassStudents",
                column: "StudentId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Submissions_Users_StudentId",
                table: "Submissions",
                column: "StudentId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TeacherClassSubjects_Users_TeacherId",
                table: "TeacherClassSubjects",
                column: "TeacherId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assignments_Users_TeacherId",
                table: "Assignments");

            migrationBuilder.DropForeignKey(
                name: "FK_ClassStudents_Users_StudentId",
                table: "ClassStudents");

            migrationBuilder.DropForeignKey(
                name: "FK_Submissions_Users_StudentId",
                table: "Submissions");

            migrationBuilder.DropForeignKey(
                name: "FK_TeacherClassSubjects_Users_TeacherId",
                table: "TeacherClassSubjects");

            migrationBuilder.AddForeignKey(
                name: "FK_Assignments_Users_TeacherId",
                table: "Assignments",
                column: "TeacherId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ClassStudents_Users_StudentId",
                table: "ClassStudents",
                column: "StudentId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Submissions_Users_StudentId",
                table: "Submissions",
                column: "StudentId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TeacherClassSubjects_Users_TeacherId",
                table: "TeacherClassSubjects",
                column: "TeacherId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
