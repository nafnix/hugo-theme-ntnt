# syntax=docker/dockerfile:1
FROM library/debian:latest

ARG USER=vscode
ARG DEBIAN_FRONTEND=noninteractive
RUN apt update \
    && apt install -y --no-install-recommends sudo zsh git curl wget apt-transport-https ca-certificates openssl \
    && apt autoremove -y \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -s /bin/zsh ${USER} \
    && echo "${USER} ALL=(ALL) NOPASSWD: ALL" >/etc/sudoers.d/${USER} \
    && chmod 0440 /etc/sudoers.d/${USER}

# VARIANT can be either 'hugo' for the standard version or 'hugo_extended' for the extended version.
ARG VARIANT=hugo
# VERSION can be either 'latest' or a specific version number
ARG VERSION=latest

# Download Hugo
RUN case ${VERSION} in \
    latest) \
    export VERSION=$(curl -s https://api.github.com/repos/gohugoio/hugo/releases/latest | grep "tag_name" | awk '{print substr($2, 3, length($2)-4)}') ;;\
    esac && \
    echo ${VERSION} && \
    case $(uname -m) in \
    aarch64) \
    export ARCH=ARM64 ;; \
    *) \
    export ARCH=64bit ;; \
    esac && \
    echo ${ARCH} && \
    wget -O ${VERSION}.tar.gz https://github.com/gohugoio/hugo/releases/download/v${VERSION}/${VARIANT}_${VERSION}_Linux-${ARCH}.tar.gz && \
    tar xf ${VERSION}.tar.gz && \
    mv hugo /usr/bin/hugo

# Hugo dev server port
EXPOSE 1313

RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime


USER ${USER}
ARG HOME=/home/${USER}
WORKDIR ${HOME}

ARG PNPM_HOME=${HOME}/.local/share/pnpm
ENV PATH="${PNPM_HOME}:$PATH"
RUN <<EOT
    wget -qO- https://get.pnpm.io/install.sh | ENV="${HOME}/.zshrc" SHELL=/bin/zsh sh -
    pnpm env use -g lts
    echo 'alias pn=pnpm' >> .zshrc
EOT

ARG OHMYZSH_HOME=${HOME}/.oh-my-zsh
ARG OHMYZSH_THEME=${OHMYZSH_HOME}/custom/themes
RUN <<EOT
    sh -c "$(curl -fsSL https://install.ohmyz.sh)"
    mkdir -p ${OHMYZSH_THEME}
    git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${OHMYZSH_THEME}/powerlevel10k
    sed -i 's|ZSH_THEME="robbyrussell"|ZSH_THEME="powerlevel10k/powerlevel10k"|g' .zshrc
    echo 'POWERLEVEL9K_DISABLE_CONFIGURATION_WIZARD=true' >> .zshrc
    hugo completion zsh > ${OHMYZSH_HOME}/plugins/git/_hugo
EOT