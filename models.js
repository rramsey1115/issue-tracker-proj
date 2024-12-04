const mongoose = require("mongoose");
const { Schema } = mongoose;

//create schema (blueprint) for your Issues you will create
const IssueSchema = new Schema({
  projectId: { type: String, required: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_on: Date,
  updated_on: Date,
  created_by: { type: String, required: true },
  assigned_to: String,
  open: Boolean,
  status_text: String,
});

//create Issue model to export
const Issue = mongoose.model("Issue", IssueSchema);

//create project schema (blueprint) for your projects you will create issues for
const ProjectSchema = new Schema({
  name: { type: String, required: true },
  issues: [IssueSchema]
});

//create Project model to export
const Project = mongoose.model("Project", ProjectSchema);


exports.Issue = Issue;
exports.Project = Project;
