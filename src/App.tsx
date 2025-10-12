import { useState } from "react";

import { Desktop } from "./components/Desktop";
import { useScale } from "./hooks/useScale";

function App() {
  const [count, setCount] = useState(0);
  const scale = useScale();
  return (
    <div className="App">
      <div className="main-wrapper">
        <Desktop />
      </div>
    </div>
  );
}

export default App;
