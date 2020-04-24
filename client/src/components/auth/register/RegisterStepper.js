import React from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { notify } from "../../../actions/notify";
import RegisterForm from "./RegisterForm";
import PhotoUpload from "./PhotoUpload";
import ProgressButton from "../../ProgressButton";

import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  loginDialog: {
    padding: theme.spacing(3),
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  dialogContainer: {
    padding: theme.spacing(3),
  },
}));

const RegisterStepper = ({ isAuthenticated, userPhoto, notify }) => {
  const classes = useStyles();
  const history = useHistory();

  const handleAuthRedirect = () => {
    if (isAuthenticated) {
      return history.push("/");
    } else {
      notify(
        "error",
        "Error during registry. Please refresh the page and try again."
      );
    }
  };

  function getSteps() {
    return [
      "Enter your account information",
      "Choose an avatar photo (optional)",
      "Complete Signup and Login",
    ];
  }

  function getStepContent(step) {
    switch (step) {
      case 0:
        return <RegisterForm handleNext={handleNext} />;
      case 1:
        return <PhotoUpload />;
      case 2:
        return (
          <Paper square elevation={0} className={classes.dialogContainer}>
            <Typography variant="body1" gutterBottom>
              All steps completed - all set to login!
            </Typography>

            <Button
              onClick={() => handleAuthRedirect()}
              variant="contained"
              color="primary"
              className={classes.button}
            >
              Login
            </Button>
          </Paper>
        );
      default:
        return "Unknown step";
    }
  }

  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const steps = getSteps();

  const isStepOptional = (step) => {
    return step === 1;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  return (
    <>
      <Dialog
        className={classes.loginDialog}
        fullWidth
        open
        aria-labelledby="form-dialog-title"
      >
        <div className={classes.root}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => {
              const stepProps = {};

              if (isStepSkipped(index)) {
                stepProps.completed = false;
              }
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel>{label}</StepLabel>
                  <StepContent>
                    {getStepContent(index)}
                    {isStepOptional(activeStep) && (
                      <div className={classes.actionsContainer}>
                        <div>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={userPhoto ? handleNext : handleSkip}
                            className={classes.button}
                          >
                            {userPhoto ? "Next" : "Skip"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </div>
      </Dialog>
    </>
  );
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  userPhoto: state.auth.userPhoto,
});

export default connect(mapStateToProps, { notify })(RegisterStepper);
