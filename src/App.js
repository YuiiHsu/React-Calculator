import style from './App.module.css';
import { useRef, useState } from 'react';

const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '00', '.'];
const operators =
{
  into: '÷',
  times: '×',
  add: '+',
  from: '-',
  equal: '='
};
const errorMsg = {
  Infinity: 'Infinity',
  Error: 'Error'
}

function App() {
  // 當前總結果
  const result = useRef(0);
  const isTotal = useRef(true);
  // 過程紀錄
  let [process, setProcess] = useState('');
  // 當前動作
  let operator = useRef(operators.add);
  // 當前顯示
  const [currentNumber, setCurrentNumber] = useState('0');

  /**
   * 使用者點擊數字或.按鍵
   * @param {*} currentNum 當前數字
   * @param {*} clickedNum 被點擊的數字
   */
  const handleNumberClicked = (e) => {
    const clickedNum = e.target.innerText;
    if (isCurrentError() || !clickedNum) return;
    const isContaonDots =
      currentNumber
        .toString()
        .indexOf('.') !== -1 && clickedNum === '.';

    // 僅能包含一個 .
    if (isContaonDots) return;

    // 開頭為0時，不得再輸入0
    const isInputZero = clickedNum === '0' || clickedNum === '00';
    const isFirstZero = currentNumber.length === 1 && currentNumber === '0';
    if (isFirstZero && isInputZero) return;
    if (operator.current === operators.equal) {
      reCalculator();
    }

    const num = currentNumber
      && ((isFirstZero && clickedNum === '.') || !isFirstZero)
      && (!isTotal.current || (isTotal.current && clickedNum === '.'))
      ? currentNumber.concat(clickedNum) : clickedNum;
    settingNumberAndSize(num);
    isTotal.current = false;
  }

  /**
   * 計算當前數字文字大小或改用科學記號
   * @param {*} currentNum 當前數字
   */
  const settingNumberAndSize = (currentNum) => {
    if (!currentNum || currentNum.length < 10) {
      setCurrentNumber(currentNum);
      return;
    }

    // 換算後小於28px時，改用科學符號記號
    const size = 560 / currentNum.length;
    if (size > 28) {
      document.getElementById("result").style.fontSize = `${size}px`;
      setCurrentNumber(currentNum);
    }
    else {
      const num = Number.parseFloat(currentNum).toExponential(10);
      setCurrentNumber(num);
    }
  }

  const reset = () => {
    settingNumberAndSize('0')
    setProcess('');
    result.current = 0;
    document.getElementById("result").style.fontSize = '56px';
  }

  const remove = () => {
    if (isCurrentError() || !currentNumber) return;

    if (currentNumber.length > 1) {
      settingNumberAndSize(currentNumber.slice(0, -1));
    }
    else {
      settingNumberAndSize('0');
    }

    return;
  }

  const isCurrentError = () => {
    return Object.values(errorMsg).includes(currentNumber);
  }

  /**
   * 加上千分位
   * @param {*} inputText 欲改成千分位顯示的字串
   * @returns 千分位格式字串
   */
  const commaFormat = (inputNum) => {
    if (!inputNum) return;

    return inputNum.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  }

  const handleOperatorAction = (e) => {
    if (isCurrentError()) return;
    const action = e.target.innerText;
    // 改運算符號
    if (process && isTotal.current) {
      setProcess(`${process.slice(0, -1)} ${action}`);
      operator.current = action;
      return;
    }

    const currentNum = currentNumber ? Number.parseFloat(currentNumber) : 0;
    switch (operator.current) {
      case operators.add:
        result.current = result.current + currentNum;
        break;
      case operators.from:
        result.current = result.current - currentNum;
        break;
      case operators.into:
        if (currentNumber === '0' && result.current === 0) {
          settingNumberAndSize(errorMsg.Error);
          return;
        }
        result.current = result.current / currentNum;
        break;
      case operators.times:
        result.current = result.current * currentNum;
        break;
      default:
        break;
    }

    setProcess(operator.current === operators.equal
      ? `${currentNumber} ${action}`
      : `${process} ${currentNumber} ${action}`);
    operator.current = action;
    settingNumberAndSize(result.current.toString());
    isTotal.current = true;
  }

  // 按了等於後，再重新計算
  const reCalculator = () => {
    result.current = 0;
    setProcess('');
    operator.current = operators.add;
  }

  return (
    <div className={style.App}>
      <div className={style.container}>
        {/* 顯示輸入資訊 */}
        <div className={style.inputShow}>
          <div className={style.process}>
            {process}
          </div>
          <div id="result" className={style.result}>
            {commaFormat(currentNumber)}
          </div>
        </div>
        {/* 數字按鍵區 */}
        <div className={style.numberArea}>
          {numbers
            .map(num => <div
              key={num}
              className={style.numberBtn}
              onClick={handleNumberClicked}>
              {num}
            </div>
            )}
        </div>

        {/* 加減乘除按鍵區 */}
        <div className={style.operatorArea}>
          {
            Object.values(operators)
              .filter(o => o !== operators.equal)
              .map(operator => <div
                key={operator}
                className={style.operatorBtn}
                onClick={handleOperatorAction}>
                {operator}
              </div>
              )}
        </div>

        {/* 歸零、等於、刪除按鍵區 */}
        <div className={style.buttonArea}>
          <div className={style.actionBtn} onClick={reset}>
            AC
          </div>
          <div className={style.actionBtn} onClick={remove}>
            ⌫
          </div>
          <div className={style.enterBtn}>
            <div className={style.text} onClick={handleOperatorAction}>
              =
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
