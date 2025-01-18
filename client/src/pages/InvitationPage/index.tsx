import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom"
import { GetInviteByCode, JoinGuildByCode } from "../../services/invite.service";
import Box from "@mui/material/Box";
import { Invite } from "../../shared/guild.interface";
import { Button, Grid, Skeleton, Typography } from "@mui/material";

export default function InvitationPage() {
    const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated);
    const [invite, setInvite] = React.useState<Invite>();
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string>();
    const { inviteCode } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const loadInvite = async () => {
        try {
            if (inviteCode) {
                const data = await GetInviteByCode(inviteCode);
                const result: Invite = {
                    _id: data._id,
                    string: data.string,
                    creator: data.creator,
                    guild: data.guild,
                }
                setInvite(result);
                console.log(result);
            }
        }
        catch (error: any) {
            if (error && error.message) {
                setErrorMessage(error.message);
            }
            else setErrorMessage(error);
        }
    }
    const joinGuildByInviteCode = async () => {
        try {
            if (inviteCode) {
                setIsLoading(true);
                const data = await JoinGuildByCode(inviteCode);
                navigate("/chat");
            }
        }
        catch (error: any) {
            setIsLoading(false);
            if (error && error.message) {
                setErrorMessage(error.message);
            }
            else setErrorMessage(error);
        }
    }

    React.useEffect(() => {
        loadInvite();
    }, [inviteCode])

    React.useEffect(() => {

    }, [invite])

    return <Grid container>
        <Grid item md={3}></Grid>
        <Grid item md={6}>
            {invite ? (
                <Box>
                    <Typography>You have invited to <b>{invite.guild.name}</b></Typography>
                    <Typography variant="body2" color={"red"}>
                        {errorMessage}
                    </Typography>
                    <Button disabled={isLoading} onClick={joinGuildByInviteCode}>Join Guild</Button>
                </Box>
            ) : (
                <Box>
                    <Skeleton variant="rectangular" />
                </Box>
            )}
        </Grid>
        <Grid item md={3}></Grid>
    </Grid>
}