import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Editor from "@monaco-editor/react";
import axios from "axios";
import ReactDiffViewer from "react-diff-viewer";
import Leaderboard from "./Leaderboard";
import useCountdown from "../utils/useCountdown";

const sampleTests = [
  { id: 1, input: "5\n10", expected: "15" },
  { id: 2, input: "7\n3", expected: "10" },
];

const ChallengeWorkspace = () => {
  const { id: challengeId } = useParams();  // 👈 this is the key fix
  const [code, setCode] = useState(
    `import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int a = sc.nextInt();\n    int b = sc.nextInt();\n    System.out.println(a + b);\n  }\n}`
  );
  const [selectedTest, setSelectedTest] = useState(sampleTests[0]);
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [expected, setExpected] = useState("");
  const [status, setStatus] = useState("");
  const [editorTheme, setEditorTheme] = useState("vs-dark");

  const countdown = useCountdown(900);
  const outputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [output]);

  const handleRun = async (submit = false) => {
    setOutput("Running...");
    try {
      const { data } = await axios.post("/api/execute", {
        code,
        stdin: customInput || selectedTest.input,
        challengeId: submit ? challengeId : null,
      });

      const textOutput = data.stdout || data.compileError || data.stderr;
      setOutput(textOutput);

      if (data.status === "PASS") toast.success("✅ Code passed!");
      else if (data.status === "FAIL") toast.warn("⚠️ Output mismatch");
      else toast.error("❌ Error occurred");

      setExpected(data.expected || selectedTest.expected);
      setStatus(data.status || "");
    } catch (err) {
      setOutput(err.toString());
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      {/* Top Bar */}
      <header className="bg-zinc-800 px-6 py-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">CodeArena</h1>
        <div className="flex items-center space-x-4">
          <span className="font-mono">
            ⏰ {String(Math.floor(countdown / 60)).padStart(2, "0")}:
            {String(countdown % 60).padStart(2, "0")}
          </span>
          <select
            value={editorTheme}
            onChange={(e) => setEditorTheme(e.target.value)}
            className="bg-zinc-700 rounded px-2 py-1 text-sm"
          >
            <option value="vs-dark">Dark</option>
            <option value="vs-light">Light</option>
            <option value="hc-black">High Contrast</option>
          </select>
          <button
            onClick={() => handleRun(true)}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold"
          >
            Submit Code
          </button>
        </div>
      </header>

      {/* Workspace */}
      <main className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <section className="w-3/5 p-4 border-r border-zinc-700 overflow-auto">
          <div className="mb-2 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Editor</h2>
            <button
              onClick={() => handleRun(false)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm font-semibold"
            >
              Run Code
            </button>
          </div>
          <Editor
            height="75vh"
            language="java"
            value={code}
            onChange={(val) => setCode(val || "")}
            theme={editorTheme}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
              formatOnType: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
            }}
          />
        </section>

        {/* Right Panel */}
        <section className="w-2/5 flex flex-col p-4 space-y-4 overflow-auto">
          {/* Test cases */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Test Cases</h2>
            <div className="flex space-x-2 mb-2">
              {sampleTests.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTest(t)}
                  className={`${
                    selectedTest.id === t.id
                      ? "bg-blue-600"
                      : "bg-zinc-700 hover:bg-zinc-600"
                  } px-3 py-1 rounded`}
                >
                  #{t.id}
                </button>
              ))}
            </div>
            <textarea
              className="w-full bg-zinc-800 text-white p-2 rounded font-mono resize-none h-16"
              value={selectedTest.input}
              readOnly
            />
          </div>

          {/* Custom input */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Custom Input (stdin)</h2>
            <textarea
              className="w-full bg-zinc-800 text-white p-2 rounded font-mono resize-none h-16"
              placeholder="Type custom input..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
            />
          </div>

          {/* Output & Diff */}
          <div className="flex-1 bg-zinc-800 rounded p-3 overflow-auto">
            <h2 className="text-lg font-semibold mb-2">
              Output{" "}
              {status && (
                <span className="text-sm font-normal">({status})</span>
              )}
            </h2>
            {expected ? (
              <ReactDiffViewer
                oldValue={expected}
                newValue={output}
                splitView={true}
                hideLineNumbers={false}
              />
            ) : (
              <pre
                ref={outputRef}
                className={`whitespace-pre-wrap ${
                  status === "RE" || output.toLowerCase().includes("error")
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {output}
              </pre>
            )}
          </div>

          {/* Leaderboard */}
          <Leaderboard challengeId={challengeId} />
        </section>
      </main>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ChallengeWorkspace;
