import { ApiRequestService } from "./shared/service/request-service";
import { v4 as uuidv4 } from "uuid";
import { Survey } from "./shared/model/common";
import { Utils } from "./shared/service/ustils.service";
export class App {
  constructor() {}
  private rs = new ApiRequestService();
  private us = new Utils();
  private survey: Survey[] | undefined = [];
  private appNode = document.getElementById("app") as HTMLElement;

  _checkNewQuestionStatus(
    addQuestionNode: HTMLButtonElement,
    survey: Survey[] | undefined
  ) {
    if (survey?.length == 10) {
      addQuestionNode.disabled = true;
    } else {
      addQuestionNode.disabled = false;
    }
  }

  _addNewQuestionClick = (
    addQuestionNode: HTMLButtonElement,
    questionContent: DocumentFragment
  ) => {
    const addStuff = async () => {
      this.survey?.push({
        prompt: "Enter your question",
        answers: [],
        id: uuidv4(),
      });
      const requestResult: boolean = await this.rs.saveSurvey(this.survey);
      console.log(requestResult);

      if (!requestResult) {
        alert("Could not save question");
        this.survey?.pop();
      } else {
        this.appNode.appendChild(questionContent.cloneNode(true));
        const allQuestions = this.appNode.querySelectorAll(".question");
        //@ts-expect-error depends on template classes
        allQuestions[allQuestions.length - 1].querySelector(
          ".question__header--index"
        ).innerHTML = this.survey?.length.toString();
        this._checkNewQuestionStatus(addQuestionNode, this.survey);
      }
      console.log(this.survey);
    };

    addQuestionNode?.addEventListener("click", addStuff);
  };

  _buttonPressed = () => {
    const doStuff = this.us.debounce((evt: Event) => {
      let isDeletingQuestion: boolean = true;
      const targetElement = evt.target as HTMLElement;
      let questionNode: HTMLElement | null | undefined = null;
      let answerNode: HTMLElement | null | undefined = null;
      let questionIndex: number | null | undefined = null;
      let answerIndex: number | null | undefined = null;

      if (
        targetElement.nodeName !== "BUTTON" ||
        targetElement.dataset.action === "noop"
      ) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.cancelBubble = true;
      } else {
        console.log("a button was clicked");
        if (targetElement.dataset.action === "delete") {
          switch (targetElement.dataset.type) {
            case "question":
              questionNode = targetElement.parentElement?.parentElement;
              break;
            case "answer":
              questionNode =
                targetElement.parentElement?.parentElement?.parentElement
                  ?.parentElement;
              answerNode = targetElement.parentElement?.parentElement;
              isDeletingQuestion = false;
              break;
            default:
              break;
          }
          //@ts-expect-error
          questionIndex = parseInt(questionNode?.dataset.questionIndex);
          if (isDeletingQuestion) {
            this.survey?.splice(questionIndex, 1);
            this.rs.saveSurvey(this.survey);
            questionNode?.remove();
          } else {
            //@ts-expect-error
            answerIndex = parseInt(answerNode?.dataset.answerIndex);
            //@ts-expect-error
            this.survey[questionIndex].answers.splice(answerIndex, 1);
            this.rs.saveQuestion(
              //@ts-expect-error
              this.survey[questionIndex],
              //@ts-expect-error
              this.survey[questionIndex].id
            );
            answerNode?.remove();
          }
        }
      }
    }, 30);
    document.addEventListener("click", doStuff);
  };

  _typeAnswer = () => {
    const addStuff = this.us.debounce((evt: KeyboardEvent) => {
      evt.preventDefault();
      evt.stopPropagation();
      let addingQuestion: boolean = true;
      const fieldTyped = evt.target as HTMLInputElement | HTMLElement;
      let questionNode: HTMLElement | null | undefined = null;
      let answerNode: HTMLElement | null | undefined = null;

      switch (fieldTyped.nodeName) {
        case "INPUT":
          questionNode = fieldTyped.parentElement;
          addingQuestion = false;
          break;
        case "SPAN":
          questionNode = fieldTyped.parentElement?.parentElement;
          break;
        default:
          break;
      }
      //@ts-expect-error
      const questionIndex = parseInt(questionNode?.dataset["questionIndex"]);
      const keyPressed = evt.key;

      if (keyPressed == "Enter" || keyPressed == "Tab") {
        if (addingQuestion) {
          //@ts-expect-error
          this.survey[questionIndex].prompt = fieldTyped.innerHTML;
        } else {
          //@ts-expect-error
          this.survey[questionIndex].answers.push(fieldTyped.value);
          console.log("adding answer");
          console.log(this.survey);
          //@ts-expect-error
          questionNode.querySelector(".answer").appendChild(
            //@ts-expect-error
            document.getElementById("answer").content.cloneNode(true)
          );
          //@ts-expect-error
          answerNode = questionNode.querySelector(".answer");
          //@ts-expect-error
          const newAnswerNode = answerNode.lastElementChild;
          //@ts-expect-error
          newAnswerNode.setAttribute(
            "data-answer-index",
            //@ts-expect-error
            this.survey[questionIndex].answers.length.toString()
          );
          //@ts-expect-error
          newAnswerNode.querySelector(".answer__header--index").innerHTML =
            this._addZeroes(
              //@ts-expect-error
              this.survey[questionIndex].answers.length
            );
          //@ts-expect-error
          newAnswerNode.querySelector(".answer__body--text").innerHTML =
            //@ts-expect-error
            fieldTyped.value;
          //@ts-expect-error
          fieldTyped.value = "";
        }
        if (addingQuestion) {
          this.rs.saveSurvey(this.survey);
        } else {
          this.rs.saveQuestion(
            //@ts-expect-error
            this.survey[questionIndex],
            //@ts-expect-error
            this.survey[questionIndex].id
          );
        }
      }
    }, 1500);
    this.appNode.addEventListener("keydown", addStuff);
  };

  _addNewQuestion = (theNode: HTMLElement) => {
    return {
      theNode,
    };
  };

  _addZeroes = (input: string) => {
    input.length == 1 ? true : (input = `0${input}`);
    return input;
  };

  _buildQuestions = (
    questionContent: DocumentFragment,
    answerContent: DocumentFragment,
    survey: Survey[]
  ) => {
    survey.forEach((question, index) => {
      this.appNode.appendChild(questionContent.cloneNode(true));
      const currentNode = this.appNode.querySelectorAll(".question")[index];
      const currentQuestionIndexNode = currentNode.querySelector(
        ".question__header--index"
      );
      const currentQuestionTitleNode = currentNode.querySelector(
        ".question__body--text"
      );
      //@ts-expect-error depends on template classes
      currentQuestionIndexNode.innerHTML = `${index + 1}`;
      //@ts-expect-error depends on template classes
      currentQuestionTitleNode.innerHTML = `${question.prompt}`;
      currentNode.setAttribute("data-question-index", index.toString());
      question.answers.forEach((answer, q_Index) => {
        const latestQuestion = currentNode.querySelector(".answer");
        latestQuestion?.appendChild(answerContent.cloneNode(true));
        const currentAnswerIndexNode = latestQuestion?.querySelectorAll(
          ".answer__header--index"
        )[q_Index];
        const currentAnswerTextNode = latestQuestion?.querySelectorAll(
          ".answer__body--text"
        )[q_Index];

        //@ts-expect-error depends on template classes
        currentAnswerIndexNode.innerHTML = `${this._addZeroes(q_Index + 1)}`;
        //@ts-expect-error depends on template classes
        currentAnswerTextNode.innerHTML = `${answer}`;
        //@ts-expect-error depends on template classes
        currentAnswerIndexNode?.parentNode?.parentNode.setAttribute(
          "data-answer-index",
          q_Index.toString()
        );
      });
    });
  };

  buildDOM = (
    questionContent: DocumentFragment,
    answerContent: DocumentFragment,
    survey: Survey[]
  ) => {
    this._buildQuestions(questionContent, answerContent, survey);
  };

  init = async () => {
    const response = await this.rs.getSurvey();
    if (response !== undefined) {
      this.survey = await response.data;
      console.log(this.survey);

      const questionNode = document.getElementById(
        "question"
      ) as HTMLTemplateElement;
      const questionContent = questionNode.content;
      const answerNode = document.getElementById(
        "answer"
      ) as HTMLTemplateElement;
      const answerContent = answerNode.content;

      const addQuestionNode = document.querySelector(
        ".question__body--add"
      ) as HTMLButtonElement;

      this.buildDOM(questionContent, answerContent, this.survey);
      this._checkNewQuestionStatus(addQuestionNode, this.survey);
      this._addNewQuestionClick(addQuestionNode, questionContent);
      this._typeAnswer();
      this._buttonPressed();
    }
  };
}
