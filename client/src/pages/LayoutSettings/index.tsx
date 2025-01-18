import { Switch } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import React from "react";
import { RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "../../redux/slices/darkModeSlice";

export default function LayoutSettings() {
    const isDarkMode = useSelector((state: RootState) => state.darkMode.isDarkMode);
    const dispatch = useDispatch();
    const handleToggle = () => {
        dispatch(toggleDarkMode());
    };
    React.useEffect(() => {
        if (isDarkMode) {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
        console.log(isDarkMode);
      }, [isDarkMode]);
    return <Grid container sx={{ height: "100vh" }}>
        <Grid
            item
            md={10}
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
            }}
        >
            <Box sx={{
                textAlign: "start"
            }}>
                <Typography variant="h2">Dark mode</Typography>
                <Switch checked={isDarkMode} onChange={handleToggle}/>
            </Box>
        </Grid>
    </Grid>
}