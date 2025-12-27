import { Box } from "@mui/material";
import "./App.css";
import Canvas from "./canvas";

function App() {
  return (
    <Box className="App" sx={{ display: "flex", height: "100vh" }}>
      <Canvas />
    </Box>
  );
}

export default App;
