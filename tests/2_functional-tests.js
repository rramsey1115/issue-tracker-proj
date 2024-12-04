const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server.js");

chai.use(chaiHttp);

let issue1;
let issue2;
suite("Functional Tests", function () {
  suite("Routing Tests", function () {
    suite("3 Post Request Tests", function () {
      test("1.1 Create an issue with every field", function (done) {
        chai
          .request(server)
          .post("/api/issues/projects")
          .set("content-type", "application/json")
          .send({
            issue_title: "Issue 1",
            issue_text: "Functional Test",
            created_by: "fcc",
            assigned_to: "Ryan",
            status_text: "Not Done",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            issue1 = res.body;
            assert.equal(res.body.issue_title, "Issue 1");
            assert.equal(res.body.assigned_to, "Ryan");
            assert.equal(res.body.created_by, "fcc");
            assert.equal(res.body.status_text, "Not Done");
            assert.equal(res.body.issue_text, "Functional Test");
            done();
          });
      }).timeout(10000); //end of test 1.1

      test("1.2 Create an isue with only required fields", function (done) {
        chai
          .request(server)
          .post("/api/issues/projects")
          .set("content-type", "application/json")
          .send({
            issue_title: "Issue 2",
            issue_text: "Functional Test",
            created_by: "fcc",
            assigned_to: "",
            status_text: "",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, "Issue 2");
            issue2 = res.body;
            assert.equal(res.body.created_by, "fcc");
            assert.equal(res.body.issue_text, "Functional Test");
            assert.equal(res.body.assigned_to, "");
            assert.equal(res.body.status_text, "");
            done();
          });
      }).timeout(10000); // end of test 1.2

      test("1.3 Create an issue with missing required fields", function (done) {
        chai
          .request(server)
          .post("/api/issues/projects")
          .send({
            issue_title: "",
            issue_text: "",
            created_by: "fcc",
            assigned_to: "",
            status_text: "",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "required field(s) missing");
            done();
          });
      }); //end of test 1.3
    }); //end of suite 1-"3 post request tests"

    suite("2 - the 3 Get Request Tests", function () {
      test("2.1 View issues on a project", function (done) {
        chai
          .request(server)
          .get("/api/issues/projects")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            // assert.equal(res.body.length, 4); //idk what this line is supposed to be doing???
            done();
          });
      }); //end of test 2.1

      test("2.2 View issues on a project with one filter", function (done) {
        chai
          .request(server)
          .get("/api/issues/projects")
          .query({
            _id: issue1._id,
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body[0].issue_title, issue1.issue_title);
            assert.equal(res.body[0].issue_text, issue1.issue_text);
            done();
          });
      }); //end of test 2.2

      test("2.3 View issues on a project with multiple filters", function (done) {
        chai
          .request(server)
          .get("/api/issues/projects")
          .query({
            issue_title: issue1.issue_title,
            issue_text: issue1.issue_text,
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body[0].issue_title, issue1.issue_title);
            assert.equal(res.body[0].issue_text, issue1.issue_text);
            done();
          });
      }); //end of test 2.3
    }); // end of suite 2 - "the 3 get request tests"

    suite("3 - the 5 PUT request tests ", function () {
      test("3.1 one field on an issue", function (done) {
        chai
          .request(server)
          .put("/api/issues/projects")
          .send({
            _id: issue1._id,
            issue_title: "different",
          })
          .end(function (err, res) {
            console.log(res.body);
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully updated");
            assert.equal(res.body._id, issue1._id);
            done();
          });
      }); //end of test 3.1

      test("3.2 Update multiple fields on an issue", function (done) {
        chai
          .request(server)
          .put("/api/issues/projects")
          .send({
            _id: issue1._id,
            issue_title: "random",
            issue_text: "random",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully updated");
            assert.equal(res.body._id, issue1._id);
            done();
          });
      }); //end of test 3.2

      test("3.3 update an issue with missing _id", function (done) {
        chai
          .request(server)
          .put("/api/issues/projects")
          .send({
            issue_title: "update title",
            issue_text: "update text",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "missing _id");
            done();
          });
      }); //end of test 3.3

      test("3.4 update an issue with no fields to update", function (done) {
        chai
          .request(server)
          .put("/api/issues/projects")
          .send({
            _id: issue1._id,
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "no update field(s) sent");
            done();
          });
      }); //end of test 3.4

      test("3.4 update an issue with an invalid _id", function (done) {
        chai
          .request(server)
          .put("/api/issues/projects")
          .send({
            _id: "5fe0c500ec2f6f4c1715a770",
            issue_text: "bad update text",
            issue_title: "bad update title",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "could not update");
            done();
          });
      }); //end of test 3.4
    }); // end of suite 3 - "the 5 PUT request tests"

    suite("4 - DELETE request Tests", function () {
      test("4.1 delete an issue", function (done) {
        chai
          .request(server)
          .delete("/api/issues/projects")
          .send({
            _id: issue1._id,
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully deleted");
          });
        chai
          .request(server)
          .delete("/api/issues/projects")
          .send({
            _id: issue2._id,
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            console.log(res.body.result);
            assert.equal(res.body.result, "successfully deleted");
          });
        done();
      }); //end of test 4.1

      test("4.2 Delete an issue with an invalid _id", function (done) {
        chai
          .request(server)
          .delete("/api/issues/projects")
          .send({
            _id: "654364bc8f71f915ddb9975f",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "could not delete");
            done();
          });
      }); //end of test 4.2

      test("4.3 Detel an issue with missing _id", function (done) {
        chai
          .request(server)
          .delete("/api/issues/projects")
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "missing _id");
            done();
          });
      }); //end of test 4.3
    }); //end of suite 4 "DELETE Request Tests"
  }); //end of "Routing Tests" suite
}); // end of "functional tests" initial suite
