import { SurveyResponse } from "./App";

export class ApiRequestService {
  public async getSurvey(): Promise<SurveyResponse | undefined> {
    const configUrl: string = `http://localhost:5000/api/questions`;
    const survey: Response = await fetch(configUrl);
    if (survey) {
      const data: Promise<SurveyResponse> = survey.json();
      return data;
    } else {
      return undefined;
    }
  }
}
