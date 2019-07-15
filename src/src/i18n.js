/**
 * Copyright 2018 bluefox <dogafox@gmail.com>
 *
 * Licensed under the Creative Commons Attribution-NonCommercial License, Version 4.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
import I18n from '@iobroker/adapter-react/i18n';

class I18nExtended extends I18n {
    static translations = {
        'en': require('./i18n/en'),
        'ru': require('./i18n/ru'),
        'de': require('./i18n/de'),
        'es': require('./i18n/es'),
        'fr': require('./i18n/fr'),
        'it': require('./i18n/it'),
        'nl': require('./i18n/nl'),
        'pl': require('./i18n/pl'),
        'pt': require('./i18n/pt'),
        'zh-cn': require('./i18n/zh-cn'),
    };
}

export default I18nExtended;