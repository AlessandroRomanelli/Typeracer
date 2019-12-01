import React, {useEffect, useState, createRef, Fragment} from 'react';
import logo from './logo.svg';
import './App.sass';
import 'bootstrap/dist/css/bootstrap.min.css';

import Container from "react-bootstrap/Container"
import Jumbotron from "react-bootstrap/Jumbotron"
import Button from "react-bootstrap/Button"

const phrases = [
    "A walking box loses a parrot below the converted case. Her hostile envelope graduates. Why does the carriage dance? The champion chalks around the spoken dependence.",
    "The boy fudges. The cult staggers in the slash. The clause monitors the documentary wash. The unattended affect blinks past the pizza. The intolerance overcomes under the export.",
    "A fortune attends inside the integrated gutter. When will a sod rise the synthesis? Above a forgotten episode cheats the pressure. In the exclusive drum glows the objectionable tennis. Why won't the square cell snack across a menu?",
    "A defeat longs for a landlord. A provoking absolute pressures a memory beneath the unified envelope. The rectified disco cooks the logic. A shape jams the west behaviour on top of a rack. Its scandal disciplines the producer."
];

const results = new Array(4).fill({});

function App() {
    const [text, setText] = useState([]);
    const [wordIdx, setWordIdx] = useState(0);
    const [input, setInput] = useState("");
    const [correctUpTo, setCorrectUpTo] = useState(0);
    const [started, setStarted] = useState(false);
    const [finished, setFinished] = useState(false);
    const [int, setInt] = useState(null);
    const [startTime, setStartTime] = useState(Date.now());
    const [count, setCount] = useState(0);
    const [errors, setErrors ] = useState([]);

    const input_el = createRef();

    useEffect(() => {
        let idx = 0;
        if (localStorage.startIndex) {
            idx = parseInt(localStorage.startIndex);
        }
        const words = phrases[idx].split(" ");
        setText(words);
        setErrors(new Array(words.length).fill(false));
        localStorage.setItem("startIndex", `${++idx % 4}`);
    }, []);

    useEffect(() => {
        if (!finished) return;
        console.log(results);
    }, [finished]);

    useEffect(() => {
        if (input_el.current) {
            input_el.current.focus();
        }
        if (int) {
            clearInterval(int);
        }
        setInt(setInterval(() => {
            const el = document.getElementById("input");
            if (el) {
                el.focus();
            }
        }, 250));
        setStartTime(Date.now());
    }, [started]);

    useEffect(() => {
        if (wordIdx === text.length) {
            setWordIdx(0);
        }
    }, [wordIdx]);

    useEffect(() => {
        if (text.length === 0) return;
        const word = text[wordIdx];

        let i = 0;
        for (; i < input.length; i++) {
            if (word[i] !== input.trim()[i]) {
                const e = [].concat(errors);
                e[wordIdx] = true;
                setErrors(e);
                break;
            }
        }

        setCorrectUpTo(i);

        if (wordIdx === text.length - 1) {
            if (i === word.length) {
                results[count] = {
                    time: (Date.now() - startTime)/1000,
                    acc: 1 - (errors.reduce((r,x) => r + x, 0) / text.length),
                    type: ["A","B","C","D"][(parseInt(localStorage.startIndex,10)+count) % 4]
                };
                setFinished(true);
            }
        }

    }, [input]);

    const handleChange = (e) => {
        const t = e.target.value;
        if (t[t.length-1] === " ") {
            if (correctUpTo === text[wordIdx].length) {
                setWordIdx(x => ++x);
                setCorrectUpTo(0);
                input_el.current.value = "";
                setInput("");
            }
            return;
        }
        setInput(e.target.value);
    };

    const handleNextPhrase = (e) => {
        e.preventDefault();
        const idx = parseInt(localStorage.startIndex);
        const words = phrases[(idx+count) % 4].split( " ");
        setText(words);
        setErrors(new Array(words.length).fill(false));
        setWordIdx(0);
        setCorrectUpTo(0);
        setInput("");
        setFinished(false);
        setStarted(true);
        setStartTime(Date.now());
        setCount(c => ++c);

    };


    return (<div className="App">
        <Jumbotron>
            <h1>Typeracer</h1>
        </Jumbotron>
        <Container>

            {text.length > 0 && count < 4 && <Fragment>
            <h3>Write the following in the input field:</h3>
                <div className={"challenge-text"}>{
                    <span className={"done"}>{text.slice(0, Math.max(wordIdx,0)).join(" ")}</span>
                    // text.map((word, i) => {
                    //     if (i === wordIdx) {
                    //         const chars = word.split("");
                    //         const right = chars.slice(0, correctUpTo);
                    //         const wrong = chars.slice(correctUpTo);
                    //         return <span key={i} className={"word"}><span>{right.join("")}</span><span>{wrong.join("")}</span></span>
                    //     }
                    //     if (i < wordIdx) {
                    //         return <span key={i} className={"word done"}>{word}</span>
                    //     }
                    //     return <span key={i} className={"word"}>{word}</span>
                    // })
                } {
                    (() => {
                        const chars = text[wordIdx].split("");
                        return <span className={"word"}><span>{chars.slice(0, correctUpTo)}</span><span>{chars.slice(correctUpTo)}</span></span>
                    })()
                } <span>{text.slice(wordIdx+1).join(" ")}</span></div>
            </Fragment>}
            {!started && !finished && <Button onClick={() => {
                setStarted(true);
            }}>Begin the test!</Button>}
            {started && !finished && <Fragment>
                <div className={"input"}>
                <span className={"right"}>
                    {input.split("").slice(0, correctUpTo)}
                </span>
                    <span className={"wrong"}>
                    {input.split("").slice(correctUpTo)}
                </span>
                </div>
                <input id={"input"} autoCapitalize={'none'} ref={input_el} type={"text"} style={{ opacity: 0}} defaultValue={""} name={"input-text"} onChange={handleChange}/>
            </Fragment>}
            {finished && count < 3 && <div className={"results"}>
                <h3>Partial Results</h3>
                <div>
                    <div>Time: {results[count].time} seconds</div>
                    <div>Accuracy: {results[count].acc}%</div>
                </div>
                <Button onClick={handleNextPhrase}>Next phrase</Button>
            </div>}
            {finished && count === 3 && <div className={"results"}>
                <h3>Final Results</h3>
                <div>
                    <div>Time: {results.reduce((r,x) => r+x.time, 0) / 4} seconds</div>
                    <div> ({ results.map(x => x.time ).join(" ") }) </div>
                    <div>Accuracy: {results.reduce((r,x) => r+x.acc, 0) / 4}%</div>
                    <div> ({ results.map(x => x.acc ).join(" ") }) </div>
                    <div>Sequence: {results.reduce((r,x) => r+x.type, "")}</div>
                </div>
                <Button onClick={handleNextPhrase}>Next phrase</Button>
            </div>}
        </Container>
    </div>);
}

export default App;
