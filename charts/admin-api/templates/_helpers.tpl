{{- define "admin-api.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "admin-api.name" -}}
{{- .Chart.Name -}}
{{- end -}}
