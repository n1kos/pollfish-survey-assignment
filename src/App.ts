import { ApiRequestService } from "./shared/service/request-service";
import { v4 as uuidv4 } from "uuid";
import DOMPurify from "dompurify";
import { Survey } from "./shared/model/common";
import { Utils } from "./shared/service/ustils.service";
export class App {
  constructor() {}
  private rs = new ApiRequestService();
  private us = new Utils();
  private survey: Survey[] | undefined = [];
  private appNode = document.getElementById("app") as HTMLElement;
  private isDirty: boolean = false;

  _checkNewQuestionStatus(
    addQuestionNode: HTMLButtonElement,
    survey: Survey[] | undefined
  ) {
    const alertBox = document.querySelector(".alert");
    if (survey?.length == 10) {
      addQuestionNode.disabled = true;
      alertBox?.classList.remove("isHidden");
    } else {
      addQuestionNode.disabled = false;
      alertBox?.classList.add("isHidden");
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
      if (!requestResult) {
        alert("Could not save question");
        this.survey?.pop();
      } else {
        this.appNode.appendChild(questionContent.cloneNode(true));
        const allQuestions = this.appNode.querySelectorAll(".question");
        const latestQuestion = allQuestions[
          allQuestions.length - 1
        ] as HTMLElement;
        latestQuestion.setAttribute(
          "data-question-index",
          (allQuestions.length - 1).toString()
        );
        //@ts-expect-error depends on template classes
        allQuestions[allQuestions.length - 1].querySelector(
          ".question__header--index"
        ).innerHTML = this.survey?.length.toString();
        this._checkNewQuestionStatus(addQuestionNode, this.survey);
      }
      window.scrollTo(0, document.body.scrollHeight);
    };

    addQuestionNode?.addEventListener("click", addStuff);
  };

  __updateQuestionIndices = () => {
    this.appNode.querySelectorAll(".question").forEach((question, index) => {
      question.setAttribute("data-question-index", index.toString());
      //@ts-expect-error
      question.querySelector(".question__header--index").innerHTML = index + 1;
    });
  };

  __updateAnswerIndices = (answerNodeParent: HTMLElement) => {
    answerNodeParent
      .querySelectorAll("[data-answer-index")
      .forEach((answer, index) => {
        answer.setAttribute("data-answer-index", index.toString());
        //@ts-expect-error
        answer.querySelector(
          ".answer__header--index"
          //@ts-expect-error
        ).innerHTML = `${this._addZeroes(index + 1)}`;
      });
  };

  __deleteContent = (targetElement: HTMLElement) => {
    let isDeletingQuestion: boolean = true;
    let questionNode: HTMLElement | null | undefined = null;
    let answerNode: HTMLElement | null | undefined = null;
    let questionIndex: number | null | undefined = null;
    let answerIndex: number | null | undefined = null;

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
      this.__updateQuestionIndices();
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
      const answerNodeParent = answerNode?.parentElement as HTMLElement;
      answerNode?.remove();
      this.__updateAnswerIndices(answerNodeParent);
    }
    this._checkNewQuestionStatus(
      //@ts-expect-error
      document.querySelector(".question__body--add"),
      this.survey
    );
  };

  __sortContent = (targetElement: HTMLElement) => {
    let isSortingQuestion: boolean = true;
    let questionNode: HTMLElement | null | undefined = null;
    let answerNode: HTMLElement | null | undefined = null;
    let swapWith: HTMLElement | undefined | null = null;
    let questionIndex: number = -1;
    let answerIndex: number = -1;

    switch (targetElement.dataset.type) {
      case "question":
        questionNode = targetElement.parentElement?.parentElement;
        break;
      case "answer":
        questionNode =
          targetElement.parentElement?.parentElement?.parentElement
            ?.parentElement;
        answerNode = targetElement.parentElement?.parentElement;
        isSortingQuestion = false;
        break;
      default:
        break;
    }
    //@ts-expect-error
    questionIndex = parseInt(questionNode.dataset.questionIndex);
    if (isSortingQuestion) {
      if (targetElement.dataset.direction === "down") {
        //@ts-expect-error
        swapWith = questionNode?.nextElementSibling;
        //@ts-expect-error
        questionNode.parentNode.insertBefore(swapWith, questionNode);
        this.us.swapArrayElements(
          this.survey,
          questionIndex,
          questionIndex + 1
        );
      } else {
        //@ts-expect-error
        swapWith = questionNode?.previousElementSibling;
        //@ts-expect-error
        questionNode.parentNode.insertBefore(questionNode, swapWith);
        this.us.swapArrayElements(
          this.survey,
          questionIndex,
          questionIndex - 1
        );
      }
      this.__updateQuestionIndices();
      this.rs.saveSurvey(this.survey);
    } else {
      //sorting answers
      //@ts-expect-error
      answerIndex = parseInt(answerNode?.dataset.answerIndex);
      if (targetElement.dataset.direction === "down") {
        //@ts-expect-error
        swapWith = answerNode?.nextElementSibling;
        //@ts-expect-error
        answerNode.parentNode.insertBefore(swapWith, answerNode);
        this.us.swapArrayElements(
          //@ts-expect-error
          this.survey[questionIndex].answers,
          answerIndex,
          answerIndex + 1
        );
      } else {
        //@ts-expect-error
        swapWith = answerNode?.previousElementSibling;
        //@ts-expect-error
        answerNode.parentNode.insertBefore(answerNode, swapWith);
        this.us.swapArrayElements(
          //@ts-expect-error
          this.survey[questionIndex].answers,
          answerIndex,
          answerIndex - 1
        );
      }
      //@ts-expect-error
      this.__updateAnswerIndices(answerNode?.parentElement);
      this.rs.saveQuestion(
        //@ts-expect-error
        this.survey[questionIndex],
        //@ts-expect-error
        this.survey[questionIndex].id
      );
      //
    }
  };

  _buttonPressed = () => {
    const doStuff = this.us.debounce((evt: Event) => {
      const targetElement = evt.target as HTMLElement;
      if (
        targetElement.nodeName !== "BUTTON" ||
        targetElement.dataset.action === "noop"
      ) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.cancelBubble = true;
      } else {
        if (targetElement.dataset.action === "delete") {
          this.__deleteContent(targetElement);
        } else if (targetElement.dataset.action === "sort") {
          this.__sortContent(targetElement);
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
      let purifiedInput: string = "";
      let questionNode: HTMLElement | null | undefined = null;
      let answerNode: HTMLElement | null | undefined = null;
      this.isDirty = true;
      switch (fieldTyped.nodeName) {
        case "INPUT":
          questionNode = fieldTyped.parentElement;
          addingQuestion = false;
          //@ts-expect-error
          purifiedInput = DOMPurify.sanitize(fieldTyped.value, {
            ALLOWED_TAGS: ["b"],
          }).trim();
          break;
        case "SPAN":
          questionNode = fieldTyped.parentElement?.parentElement;
          purifiedInput = DOMPurify.sanitize(fieldTyped.innerHTML, {
            ALLOWED_TAGS: ["b"],
          }).trim();
          break;
        default:
          break;
      }
      //@ts-expect-error
      const questionIndex = parseInt(questionNode?.dataset["questionIndex"]);
      const keyPressed = evt.key;

      if (keyPressed == "Enter" || keyPressed == "Tab") {
        if (addingQuestion) {
          if (purifiedInput === "") {
            if (confirm("Do you want to delete the question?")) {
              //@ts-expect-error
              questionNode?.querySelector(".question__body--delete").click();
            } else {
              purifiedInput = "Type your question";
            }
          }
          fieldTyped.innerHTML = purifiedInput;
          //@ts-expect-error
          this.survey[questionIndex].prompt = purifiedInput;
        } else {
          //@ts-expect-error
          if (fieldTyped.value.match(/\S+/g) === null) return;
          //@ts-expect-error this
          this.survey[questionIndex].answers.push(purifiedInput);
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
            (this.survey[questionIndex].answers.length - 1).toString()
          );
          //@ts-expect-error
          newAnswerNode.querySelector(".answer__header--index").innerHTML =
            this._addZeroes(
              //@ts-expect-error
              this.survey[questionIndex].answers.length
            );
          //@ts-expect-error
          newAnswerNode.querySelector(".answer__body--text").innerHTML =
            purifiedInput;
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
        this.isDirty = false;
      }
    }, 150);
    this.appNode.addEventListener("keydown", addStuff);
  };

  _addZeroes = (input: string) => {
    parseInt(input) < 10 ? (input = `0${input}`) : true;
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
