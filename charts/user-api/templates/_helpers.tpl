{{- define "user-api.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "user-api.name" -}}
{{- .Chart.Name -}}
{{- end -}}
