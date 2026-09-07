#! /bin/sh

#
#   Copyright 2026 Deutsches Zentrum für Luft- und Raumfahrt e.V.
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#

if [ -z "$API_URL" ]
then
    echo "API_URL is unset";
    return 1;
else
    echo "API_URL is set to '$API_URL'";
fi

envsubst '$${API_URL}' < /usr/share/nginx/html/assets/config.templ.json > /usr/share/nginx/html/assets/config.json

exec nginx -g 'daemon off;'