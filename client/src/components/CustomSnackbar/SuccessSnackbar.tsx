import { Card, CardActions, IconButton, Typography } from "@mui/material";
import { CustomContentProps, SnackbarContent, closeSnackbar } from "notistack";
import { useState, forwardRef, useCallback } from "react";
import CloseIcon from "@mui/icons-material/Close";
interface SuccessSnackbarProps extends CustomContentProps {
    allowDownload?: boolean;
}
const SuccessSnackbar = forwardRef<HTMLDivElement, SuccessSnackbarProps>(({ id, ...props }, ref) => {
    const handleDismiss = useCallback(() => {
        closeSnackbar(id);
      }, [id, closeSnackbar]);
    return (
        <SnackbarContent ref={ref}>
            <Card style={{
                width: "100%",
                backgroundColor: "var(--joy-palette-success-500, #1F7A1F)",
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
            </Card>
        </SnackbarContent>
    )
}
);

export default SuccessSnackbar;