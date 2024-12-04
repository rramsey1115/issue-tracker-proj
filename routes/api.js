"use strict";

const IssueModel = require("../models.js").Issue;
const ProjectModel = require("../models.js").Project;

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    //get request starts here---------------------------------------------------
    .get(async (req, res) => {
      let projectName = req.params.project;

      try {
        const project = await ProjectModel.findOne({ name: projectName });
        if (!project) {
          res.json([{ error: "project not found" }]);
          return;
        } else {
          const issues = await IssueModel.find({
            projectId: project._id,
            ...req.query,
          });
          if (!issues) {
            res.json([{ error: "no issues found" }]);
            return;
          }
          res.json(issues);
          return;
        }
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: "could not get" });
      }
    }) //get request ends here------------------------------------------------

    //Post starts here---------------------------------------------------------
    .post(async (req, res) => {
      let projectName = req.params.project;

      //establish the request info to be sent
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;

      //check if missing title, test, or created by
      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "required field(s) missing" });
        return;
      }
      //try to find a project with matching name
      try {
        let projectModel = await ProjectModel.findOne({ name: projectName });
        //if none found, create a new project
        if (!projectModel) {
          projectModel = new ProjectModel({ name: projectName });
          projectModel = await projectModel.save();
        }
        //create a new issue
        const issueModel = new IssueModel({
          projectId: projectModel._id,
          issue_title: issue_title || "",
          issue_text: issue_text || "",
          created_on: new Date(),
          updated_on: new Date(),
          created_by: created_by || "",
          assigned_to: assigned_to || "",
          open: true,
          status_text: status_text || "",
        });
        //save issue
        const issue = await issueModel.save();
        res.json(issue);
      } catch (err) {
        //any errors with trigger catch and give the error response
        console.log(err);
        res.status(500).json({ error: "could not post" });
      }
    }) //.post() ends here----------------------------------------------------------

    //put request starts here-----------------------------------------------------
    .put(async (req, res) => {
      let projectName = req.params.project;

      //establish the request info to be sent
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.body;

      //make suere there is an id in the req
      if (!_id) {
        res.json({ error: "missing _id" });
        return;
      }
      if (
        !issue_text &&
        !issue_title &&
        !created_by &&
        !assigned_to &&
        !status_text &&
        !open
      ) {
        res.json({ error: "no update field(s) sent", _id: _id });
        return;
      }

      //find existing project in database to edit
      try {
        const projectModel = await ProjectModel.findOne({ name: projectName });
        if (!projectModel) {
          throw new Error("project not found");
        }
        let issue = await IssueModel.findByIdAndUpdate(_id, {
          ...req.body,
          updated_on: new Date(),
        });
        await issue.save();
        res.json({ result: "successfully updated", _id: _id });
      } catch (err) {
        console.log(err);
        res.json({ error: "could not update", _id: _id });
      }
    }) //put request ends here--------------------------------------------------------------

    //delete request starts here-------------------------------------------------------
    .delete(async (req, res) => {
      //delete starts here
      let projectName = req.params.project;
      const { _id } = req.body;
      if (!_id) {
        res.json({ error: "missing _id" });
        return;
      }

      try {
        const projectModel = await ProjectModel.findOne({ name: projectName });
        if (!projectModel) {
          throw new Error("project not found");
        }
        const result = await IssueModel.deleteOne({
          _id: _id,
          projectId: projectModel._id,
        });
        if (result.deletedCount === 0) {
          throw new Error("ID not found");
        }
        res.send({ result: "successfully deleted", _id: _id });
      } catch (err) {
        res.json({ error: "could not delete", _id: _id });
      }
    }); //delete ends here--------------------------------------------------------------
}; //closing bracket for module exports containing all endpoints
