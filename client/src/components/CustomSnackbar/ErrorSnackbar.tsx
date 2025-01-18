import { Card, CardActions, Collapse, IconButton, Paper, Typography } from "@mui/material";
import { CustomContentProps, SnackbarContent, closeSnackbar } from "notistack";
import { useState, forwardRef, useCallback } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import clsx from "clsx";
import CloseIcon from "@mui/icons-material/Close";
interface ErrorSnackbarProps extends CustomContentProps {
    errorDetailMessage: string;
}
const ErrorSnackbar = forwardRef<HTMLDivElement, ErrorSnackbarProps>(({ id, ...props }, ref) => {
    const [expanded, setExpanded] = useState(false);
    const handleExpandClick = useCallback(() => {
        setExpanded((oldExpanded) => !oldExpanded);
      }, []);
    const handleDismiss = useCallback(() => {
        closeSnackbar(id);
      }, [id, closeSnackbar]);
    return (
        <SnackbarContent ref={ref}>
            <Card style={{
                width: "100%",
                backgroundColor: "var(--joy-palette-danger-500, #C41C1C)",
            }}>
                <CardActions style={{
                    padding: "8px 8px 8px 16px",
                    justifyContent: "space-between"
                }}>
                    <Typography variant="body1" style={{
                        color: "var(--joy-palette-common-white, #FFF)"
                    }}>
                        {props.message}
                    </Typography>
                    <div>
                        {props.errorDetailMessage && (
                            <IconButton
                            aria-label="Show more"
                            size="small"
                            className={clsx({
                                padding: "8px 8px",
                                transform: "rotate(0deg)",
                                color: "#FFF",
                                transition: "all .2s"
                            }, {
                              [clsx({
                                transform: "rotate(180deg)",
                              })]: expanded
                            })}
                            onClick={handleExpandClick}
                            >
                                <ExpandMoreIcon />
                            </IconButton>
                        )}
                        <IconButton
                            size="small"
                            style={{
                                padding: "8px 8px",
                                transform: "rotate(0deg)",
                                color: "#FFF",
                                transition: "all .2s"
                            }}
                            onClick={handleDismiss}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </div>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Paper style={{
                        backgroundColor: "#fff",
                        padding: 16
                    }}>
                    <Typography
                        gutterBottom
                        variant="caption"
                        style={{ color: "#000", display: "block" }}
                    >
                        {props.errorDetailMessage}
                    </Typography>
                    </Paper>
                </Collapse>
            </Card>
        </SnackbarContent>
    )
}
);

export default ErrorSnackbar;