import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton"

const MessageLoading = () => {
    return <Box
        sx={{
            display: 'flex',
            gap: 1,
            py: 0.8,
        }}
    >
        <Box>
            <Skeleton animation="wave" sx={{ bgcolor: 'gray' }} variant="circular" width={42} height={42} />
        </Box>
        <Box sx={{ width: '100%' }}>
            <Skeleton animation="wave" sx={{ bgcolor: 'gray' }} height={15} width="20%" />
            <Skeleton
                animation="wave"
                height={30}
                width="80%"
                sx={{ bgcolor: 'gray' }}
                style={{ marginBottom: 6 }}
            />
        </Box>
    </Box>
}

export default MessageLoading;