// src/App.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  Divider,
  Link,
  Switch,
  FormControlLabel,
  CssBaseline,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const BACKEND_API_URL = `http://${window.location.hostname}:5000`;

const App = () => {
  const [assignments, setAssignments] = useState({});
  const [userName, setUserName] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  useEffect(() => {
    // Fetch user data
    axios
      .get(`${BACKEND_API_URL}/user`)
      .then((response) => {
        setUserName(response.data.name);
        document.title = `${response.data.name} - Canvas`;
      })
      .catch((error) => console.error(error));

    // Fetch assignments
    axios
      .get(`${BACKEND_API_URL}/todo`)
      .then((response) => {
        const grouped = groupBy(response.data, "course_name");
        setAssignments(grouped);
      })
      .catch((error) => console.error(error));
  }, []);

  const groupBy = (xs, key) => {
    return xs.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  const handleDarkModeToggle = () => setDarkMode((prev) => !prev);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container style={{ marginTop: "80px" }}>
        <AppBar position="fixed">
          <Toolbar>
            <Typography variant="h6">{userName}'s Schedule</Typography>
            <FormControlLabel
              control={
                <Switch checked={darkMode} onChange={handleDarkModeToggle} />
              }
              label="Dark Mode"
              style={{ marginLeft: "auto" }}
            />
          </Toolbar>
        </AppBar>
        <div style={{ paddingTop: "80px" }}>
          <Typography variant="h4" gutterBottom>
            {userName}'s Assignments
          </Typography>
          {Object.keys(assignments).map((course) => (
            <div key={course} id={course}>
              <Typography variant="h5" style={{ marginTop: "16px" }}>
                {course}
              </Typography>
              <Divider />
              <List>
                {assignments[course].map((assignment) => (
                  <AssignmentCard
                    key={assignment.assignment.id}
                    assignment={assignment.assignment}
                    theme={theme}
                  />
                ))}
              </List>
            </div>
          ))}
        </div>
      </Container>
    </ThemeProvider>
  );
};

// Separate component for the Assignment card
const AssignmentCard = ({ assignment, theme }) => {
  const description = assignment.description || "No description body";
  const title = assignment.name;
  const dueDate = new Date(assignment.due_at);
  const isLate = new Date() > dueDate;
  const due = `${dueDate.toLocaleString()}${isLate ? " (late)" : ""}${
    assignment.locked_for_user ? " 🔒" : ""
  }`;

  return (
    <Card
      style={{
        margin: "16px 0",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <CardContent>
        <Typography variant="h6" component="div">
          <Link
            href={assignment.html_url}
            style={{ color: theme.palette.text.primary }}
          >
            {title}
          </Link>
        </Typography>
        <Typography variant="body2" color={isLate ? "error" : "textSecondary"}>
          Due: {due}
        </Typography>
      </CardContent>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" color="textSecondary">
            Description
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography
            variant="body2"
            color="textSecondary"
            dangerouslySetInnerHTML={{ __html: description }}
            style={{ marginTop: "8px" }}
          />
        </AccordionDetails>
      </Accordion>
    </Card>
  );
};

export default App;
